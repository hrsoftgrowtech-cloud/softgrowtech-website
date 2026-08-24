-- SoftGrowTech — New Students verification setup
-- Run this ONCE in Supabase SQL Editor.
-- It is intentionally separate from the legacy Students / verify_student flow.

DROP FUNCTION IF EXISTS public.verify_new_student(text, text);

CREATE OR REPLACE FUNCTION public.verify_new_student(
  p_student_id text,
  p_mobile_last4 text
)
RETURNS TABLE (
  "Student Id" text,
  "Name" text,
  "Domain" text,
  "Student Email" text,
  "Batch Start" date,
  confirmed boolean
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    n."Student Id",
    n."Name",
    n."Domain",
    n."Student Email",
    n."Batch Start",
    EXISTS (
      SELECT 1
      FROM public."Confirmations" c
      WHERE upper(trim(c."Student Id")) = upper(trim(n."Student Id"))
    ) AS confirmed
  FROM public."New_Students" n
  WHERE upper(trim(n."Student Id")) = upper(trim(p_student_id))
    AND right(
      regexp_replace(coalesce(n."Mobile", ''), '[^0-9]', '', 'g'),
      4
    ) = right(
      regexp_replace(coalesce(p_mobile_last4, ''), '[^0-9]', '', 'g'),
      4
    )
  LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public.verify_new_student(text, text) TO anon;
GRANT EXECUTE ON FUNCTION public.verify_new_student(text, text) TO authenticated;
