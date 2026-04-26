
# Sirf Supabase se Wapas Connect Karo

Aapka Supabase project, tables, RLS, storage bucket, trigger — sab pehle se ready hai. Bas frontend code ko MySQL API (`localhost:3001`) se hata ke wapas Supabase SDK pe le aana hai. **MySQL backend ZIP, schema.sql, ya database me kuch bhi touch nahi karunga.**

## Changes

### 1. `src/hooks/useAuth.tsx`
- `api()` calls hatao. `supabase.auth.signUp` (with `emailRedirectTo: window.location.origin` aur `options.data: { full_name, whatsapp }`), `signInWithPassword`, `signOut` use karo.
- `onAuthStateChange` listener pehle setup, fir `getSession()` (Supabase best practice).

### 2. `src/hooks/useProfile.tsx`
- `supabase.from("profiles").select("*").eq("user_id", user.id).maybeSingle()` for fetch.
- `supabase.from("profiles").update(...).eq("user_id", user.id)` for update.

### 3. `src/lib/equipmentData.ts`
- Equipment list: `supabase.from("equipment").select("*, districts(name), talukas(name), villages(name)")` — manual joins hatao.
- Create / update / delete: Supabase SDK se.
- Districts / talukas / villages: `supabase.from(...).select("*")`.
- Photo upload: `supabase.storage.from("equipment-photos").upload(...)` + `getPublicUrl(...)`.

### 4. `src/pages/Auth.tsx`
- Sirf hook signature match karna — UI same.

### 5. `src/components/MyEquipmentList.tsx`
- Owner filter Supabase query me: `.eq("owner_user_id", user.id)`.

### 6. `src/lib/api.ts`
- Delete (ab koi use nahi).

## Kya NAHI Karunga

- ❌ Supabase database me koi SQL change nahi
- ❌ Tables, RLS, triggers, storage — kuch nahi chhedunga
- ❌ MySQL backend ZIP / `server.js` / `schema.sql` waise hi rahenge
- ❌ Koi naya migration nahi

## Result

Lovable preview turant chalu, login/signup/profile/equipment/photos sab Supabase se. Aapka purana data jo Supabase me hai, sab waise hi dikhne lagega.
