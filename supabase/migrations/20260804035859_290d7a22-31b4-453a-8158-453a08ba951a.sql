-- 1&2: trigger functions should not be callable directly by clients
REVOKE ALL ON FUNCTION public.handle_new_user() FROM anon, authenticated, public;
REVOKE ALL ON FUNCTION public.update_updated_at_column() FROM anon, authenticated, public;

-- 3: prevent listing all files in the public equipment-photos bucket
DROP POLICY IF EXISTS "Equipment photos are publicly viewable" ON storage.objects;
CREATE POLICY "Owners can view their own equipment photos"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'equipment-photos' AND (auth.uid())::text = (storage.foldername(name))[1]);

-- 4: profiles contain personal contact details -> only own row readable
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Users can view their own profile"
ON public.profiles FOR SELECT TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile"
ON public.profiles FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

REVOKE ALL ON TABLE public.profiles FROM anon;
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;