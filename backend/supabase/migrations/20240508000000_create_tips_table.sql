-- Migration: Create tips table and set up proper policies
DO $$ 
BEGIN
    -- Create tips table if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_tables 
        WHERE schemaname = 'public' AND tablename = 'tips'
    ) THEN
        CREATE TABLE tips (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
            waiter_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
            table_id UUID REFERENCES tables(id) ON DELETE SET NULL,
            amount DECIMAL(10,2) NOT NULL CHECK (amount >= 0),
            order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
        );

        -- Create a trigger to update the updated_at column
        CREATE TRIGGER update_tips_updated_at
            BEFORE UPDATE ON tips
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();

        -- Enable RLS
        ALTER TABLE tips ENABLE ROW LEVEL SECURITY;

        -- Create policies
        -- Only admin and staff can see all tips
        CREATE POLICY "Admin and staff can view all tips" ON tips
            FOR SELECT USING (
                auth.uid() IN (
                    SELECT id FROM profiles WHERE role IN ('admin', 'staff')
                )
            );

        -- Users can only see their own tips
        CREATE POLICY "Users can view their own tips" ON tips
            FOR SELECT USING (
                auth.uid() = user_id
            );

        -- Users can create tips
        CREATE POLICY "Users can create tips" ON tips
            FOR INSERT WITH CHECK (
                auth.uid() = user_id
            );

        -- Users can update their own tips
        CREATE POLICY "Users can update their own tips" ON tips
            FOR UPDATE USING (
                auth.uid() = user_id
            );

        -- Users can delete their own tips
        CREATE POLICY "Users can delete their own tips" ON tips
            FOR DELETE USING (
                auth.uid() = user_id
            );

    END IF;
END $$;
