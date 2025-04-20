-- Drop existing update policy
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

-- Create new update policy that allows admins to update any profile
CREATE POLICY "Users can update own profile and admins can update any profile"
    ON profiles FOR UPDATE
    USING (
        auth.uid() = id 
        OR 
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role = 'admin'
        )
    );

-- Add index to improve performance of role checks
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
