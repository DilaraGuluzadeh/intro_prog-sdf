-- ====================================================================
-- SDF 1 (Programming Fundamentals, group 1248) — SUPABASE TABLES AND SECURITY RULES (RLS)
-- Paste into Supabase Dashboard -> "SQL Editor" and press "RUN".
-- The script can be run again (it also upgrades an existing database and does not delete data).
-- ====================================================================

-- 1. Results table
CREATE TABLE IF NOT EXISTS public.exam_submissions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    student_name TEXT NOT NULL,
    student_group TEXT NOT NULL,
    student_id TEXT,                 -- number in the class list (1-20)
    variant TEXT NOT NULL,
    score INTEGER NOT NULL,
    max_score INTEGER DEFAULT 100,
    violations INTEGER DEFAULT 0,
    status TEXT NOT NULL,            -- 'COMPLETED', 'DISQUALIFIED_3_WARNINGS', 'TIME_UP'
    answers JSONB,                   -- all answers of the student
    breakdown JSONB,                 -- {scores: {T1: 10, T2: 6, ...}, grading, violation_log, ...}
    annulled_at TIMESTAMP WITH TIME ZONE  -- set when the teacher pressed "Restart": the result is cancelled
);

-- For older databases (adds the column if it is missing)
ALTER TABLE public.exam_submissions ADD COLUMN IF NOT EXISTS annulled_at TIMESTAMP WITH TIME ZONE;

-- 2. Row Level Security
ALTER TABLE public.exam_submissions ENABLE ROW LEVEL SECURITY;

-- Rule 1: the anonymous user (student) can ONLY submit a result — with sensible values
-- (the first DROP removes the policy of the previous, Azerbaijani-language version, if it exists)
DROP POLICY IF EXISTS "Anonim tələbə nəticə göndərə bilər" ON public.exam_submissions;
DROP POLICY IF EXISTS "Anonymous student can submit a result" ON public.exam_submissions;
CREATE POLICY "Anonymous student can submit a result"
ON public.exam_submissions
FOR INSERT
TO anon
WITH CHECK (
    score BETWEEN 0 AND 100
    AND violations BETWEEN 0 AND 3
    AND status IN ('COMPLETED', 'DISQUALIFIED_3_WARNINGS', 'TIME_UP')
    AND char_length(student_name) BETWEEN 1 AND 100
    AND char_length(student_group) <= 30
    AND annulled_at IS NULL
);

-- Rule 2: the anonymous user CANNOT read the table.
-- (The "USING (true)" rule of an old version let anyone with the anon key — i.e. every
--  student — read all answers. That rule is removed.)
DROP POLICY IF EXISTS "Müəllim nəticələri oxuya bilər" ON public.exam_submissions;

-- 3. Checking the teacher password (on the server only; students cannot call this function).
--    The password hash is stored in the sdf1_admin table (the password is not written in this script).
--    To set / change the password, run this single line SEPARATELY in the SQL Editor
--    (replace YOUR_PASSWORD with your password; it must be the same as ADMIN_PASSWORD in Vercel):
--
--    INSERT INTO public.sdf1_admin (id, hash) VALUES (1, encode(sha256(convert_to('YOUR_PASSWORD', 'UTF8')), 'hex'))
--    ON CONFLICT (id) DO UPDATE SET hash = excluded.hash;
--
CREATE TABLE IF NOT EXISTS public.sdf1_admin (id INTEGER PRIMARY KEY CHECK (id = 1), hash TEXT NOT NULL);
ALTER TABLE public.sdf1_admin ENABLE ROW LEVEL SECURITY;   -- no policy: anon and authenticated cannot read it
REVOKE ALL ON public.sdf1_admin FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION public._sdf1_check_admin(p_password TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_hash TEXT;
BEGIN
    SELECT hash INTO v_hash FROM public.sdf1_admin WHERE id = 1;
    IF v_hash IS NULL THEN
        RAISE EXCEPTION 'The teacher password has not been set yet (run the INSERT line from the comment of section 3 in supabase_setup.sql)' USING ERRCODE = '28P01';
    END IF;
    IF encode(sha256(convert_to(coalesce(p_password, ''), 'UTF8')), 'hex') <> v_hash THEN
        RAISE EXCEPTION 'Access denied: wrong teacher password' USING ERRCODE = '28P01';
    END IF;
END;
$$;
REVOKE ALL ON FUNCTION public._sdf1_check_admin(TEXT) FROM PUBLIC, anon, authenticated;

-- 4. Teacher panel: read all results (with the password)
CREATE OR REPLACE FUNCTION public.admin_list_submissions(p_password TEXT)
RETURNS SETOF public.exam_submissions
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    PERFORM public._sdf1_check_admin(p_password);
    RETURN QUERY SELECT * FROM public.exam_submissions ORDER BY created_at DESC;
END;
$$;
REVOKE ALL ON FUNCTION public.admin_list_submissions(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_list_submissions(TEXT) TO anon, authenticated;

-- 5. Teacher panel: cancel a student's result and allow the exam to be restarted (with the password).
--    The result is not deleted, it is marked as "cancelled" (the history is kept).
CREATE OR REPLACE FUNCTION public.admin_reset_submission(p_password TEXT, p_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    PERFORM public._sdf1_check_admin(p_password);
    UPDATE public.exam_submissions SET annulled_at = now() WHERE id = p_id AND annulled_at IS NULL;
END;
$$;
REVOKE ALL ON FUNCTION public.admin_reset_submission(TEXT, UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_reset_submission(TEXT, UUID) TO anon, authenticated;

-- 6. Student portal: is there already a (non-cancelled) result for this list number?
--    If so, the exam cannot start again — only after the teacher presses "Restart".
CREATE OR REPLACE FUNCTION public.seat_is_taken(p_group TEXT, p_sira TEXT)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.exam_submissions
        WHERE student_group = p_group AND student_id = p_sira AND annulled_at IS NULL
    );
$$;
REVOKE ALL ON FUNCTION public.seat_is_taken(TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.seat_is_taken(TEXT, TEXT) TO anon, authenticated;

-- 7. Student portal: has the teacher cancelled my result? (only with the secret id of one's own result)
CREATE OR REPLACE FUNCTION public.submission_was_reset(p_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (SELECT 1 FROM public.exam_submissions WHERE id = p_id AND annulled_at IS NOT NULL);
$$;
REVOKE ALL ON FUNCTION public.submission_was_reset(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.submission_was_reset(UUID) TO anon, authenticated;

-- ====================================================================
-- LIVE MONITORING (the teacher sees the students during the exam)
-- ====================================================================

-- 8. Live state of the students taking the exam (one row per student)
CREATE TABLE IF NOT EXISTS public.exam_live (
    session_id UUID PRIMARY KEY,
    student_group TEXT NOT NULL,
    student_id TEXT NOT NULL,
    student_name TEXT NOT NULL,
    variant TEXT NOT NULL,
    started_at TIMESTAMP WITH TIME ZONE NOT NULL,
    last_seen TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    violations INTEGER NOT NULL DEFAULT 0,
    state TEXT NOT NULL,             -- 'active' (working), 'finished', 'terminated' (disqualified)
    progress JSONB                   -- {answers, tested, answered, violation_log}
);
ALTER TABLE public.exam_live ENABLE ROW LEVEL SECURITY;
-- There is no RLS policy: students can neither read nor write the table directly — only through the functions below.

-- 9. Student portal: sending the live state — student_heartbeat (below, section 13)

-- 10. Teacher panel: reading the live state (with the password; last 6 hours)
CREATE OR REPLACE FUNCTION public.admin_list_live(p_password TEXT)
RETURNS SETOF public.exam_live
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    PERFORM public._sdf1_check_admin(p_password);
    RETURN QUERY SELECT * FROM public.exam_live
        WHERE last_seen > now() - interval '6 hours'
        ORDER BY last_seen DESC;
END;
$$;
REVOKE ALL ON FUNCTION public.admin_list_live(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_list_live(TEXT) TO anon, authenticated;

-- ====================================================================
-- NUMBER LOCK: only ONE exam can run with a given number at a time
-- ====================================================================

-- 11. Clean up old / duplicate active sessions (before the unique index)
UPDATE public.exam_live SET state = 'expired'
WHERE state = 'active' AND started_at < now() - interval '100 minutes';

UPDATE public.exam_live l SET state = 'released'
WHERE l.state = 'active' AND EXISTS (
    SELECT 1 FROM public.exam_live o
    WHERE o.state = 'active' AND o.student_group = l.student_group AND o.student_id = l.student_id
      AND (o.last_seen > l.last_seen OR (o.last_seen = l.last_seen AND o.session_id > l.session_id)));

-- Only one active session per group + number (even with two simultaneous clicks — enforced by the database)
CREATE UNIQUE INDEX IF NOT EXISTS exam_live_one_active_seat
    ON public.exam_live (student_group, student_id) WHERE state = 'active';

-- 12. Student portal: claiming the number when the exam starts.
--     Result: 'ok' | 'submitted' (a result already exists for this number) | 'in_use' (an exam with this number is running now)
CREATE OR REPLACE FUNCTION public.claim_seat(
    p_session_id UUID, p_group TEXT, p_sira TEXT, p_name TEXT, p_variant TEXT, p_started_at TIMESTAMP WITH TIME ZONE)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF p_session_id IS NULL OR p_sira !~ '^[0-9]{1,3}$'
       OR char_length(coalesce(p_name, '')) NOT BETWEEN 1 AND 100 OR char_length(coalesce(p_group, '')) > 30 THEN
        RAISE EXCEPTION 'Invalid data' USING ERRCODE = '22023';
    END IF;

    IF EXISTS (SELECT 1 FROM public.exam_submissions
               WHERE student_group = p_group AND student_id = p_sira AND annulled_at IS NULL) THEN
        RETURN 'submitted';
    END IF;

    -- sessions whose time ran out long ago (closed and abandoned) do not hold the number
    UPDATE public.exam_live SET state = 'expired'
    WHERE student_group = p_group AND student_id = p_sira AND state = 'active'
      AND started_at < now() - interval '100 minutes';

    BEGIN
        INSERT INTO public.exam_live
            (session_id, student_group, student_id, student_name, variant, started_at, last_seen, violations, state, progress)
        VALUES
            (p_session_id, p_group, p_sira, p_name, p_variant, p_started_at, now(), 0, 'active', '{}'::jsonb)
        ON CONFLICT (session_id) DO NOTHING;
    EXCEPTION WHEN unique_violation THEN
        RETURN 'in_use';
    END;

    -- a repeated call with the same session_id (e.g. a network retry) — still 'ok'
    IF EXISTS (SELECT 1 FROM public.exam_live WHERE session_id = p_session_id AND state = 'active') THEN
        RETURN 'ok';
    END IF;
    RETURN 'in_use';
END;
$$;
REVOKE ALL ON FUNCTION public.claim_seat(UUID, TEXT, TEXT, TEXT, TEXT, TIMESTAMP WITH TIME ZONE) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.claim_seat(UUID, TEXT, TEXT, TEXT, TEXT, TIMESTAMP WITH TIME ZONE) TO anon, authenticated;

-- 13. student_heartbeat returns the state of the session (if the teacher released the number: 'released')
DROP FUNCTION IF EXISTS public.student_heartbeat(UUID, TEXT, TEXT, TEXT, TEXT, TIMESTAMP WITH TIME ZONE, INTEGER, TEXT, JSONB);
CREATE FUNCTION public.student_heartbeat(
    p_session_id UUID, p_group TEXT, p_sira TEXT, p_name TEXT, p_variant TEXT,
    p_started_at TIMESTAMP WITH TIME ZONE, p_violations INTEGER, p_state TEXT, p_progress JSONB)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_state TEXT;
BEGIN
    IF p_session_id IS NULL
       OR p_sira !~ '^[0-9]{1,3}$'
       OR char_length(coalesce(p_name, '')) NOT BETWEEN 1 AND 100
       OR char_length(coalesce(p_group, '')) > 30
       OR p_state NOT IN ('active', 'finished', 'terminated')
       OR p_violations NOT BETWEEN 0 AND 3
       OR octet_length(coalesce(p_progress::text, '')) > 300000 THEN
        RAISE EXCEPTION 'Invalid data' USING ERRCODE = '22023';
    END IF;

    UPDATE public.exam_live AS l SET
        last_seen  = now(),
        violations = GREATEST(l.violations, p_violations),
        state      = CASE WHEN l.state = 'active' THEN p_state ELSE l.state END,
        progress   = p_progress
    WHERE l.session_id = p_session_id
    RETURNING l.state INTO v_state;

    IF NOT FOUND THEN
        -- a session left over from an old version: write it if the number is free, otherwise 'in_use'
        BEGIN
            INSERT INTO public.exam_live
                (session_id, student_group, student_id, student_name, variant, started_at, last_seen, violations, state, progress)
            VALUES
                (p_session_id, p_group, p_sira, p_name, p_variant, p_started_at, now(), p_violations, p_state, p_progress);
            v_state := p_state;
        EXCEPTION WHEN unique_violation THEN
            RETURN 'in_use';
        END;
    END IF;
    RETURN v_state;
END;
$$;
REVOKE ALL ON FUNCTION public.student_heartbeat(UUID, TEXT, TEXT, TEXT, TEXT, TIMESTAMP WITH TIME ZONE, INTEGER, TEXT, JSONB) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.student_heartbeat(UUID, TEXT, TEXT, TEXT, TEXT, TIMESTAMP WITH TIME ZONE, INTEGER, TEXT, JSONB) TO anon, authenticated;

-- 14. Teacher panel: stop a running session and release the number (e.g. the computer broke down)
CREATE OR REPLACE FUNCTION public.admin_release_live(p_password TEXT, p_session_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    PERFORM public._sdf1_check_admin(p_password);
    UPDATE public.exam_live SET state = 'released' WHERE session_id = p_session_id AND state = 'active';
END;
$$;
REVOKE ALL ON FUNCTION public.admin_release_live(TEXT, UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_release_live(TEXT, UUID) TO anon, authenticated;
