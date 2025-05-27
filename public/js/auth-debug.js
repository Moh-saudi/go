// HAGZZ GO Supabase Auth Debug Tool
// Run this in the browser console to diagnose authentication issues

window.authDebug = {
  // Check current session
  checkSession: async function() {
    if (!window.supabase) {
      console.error('Error: Supabase client not found');
      return;
    }
    
    console.log('Checking current session...');
    const { data, error } = await window.supabase.auth.getSession();
    
    if (error) {
      console.error('Error getting session:', error);
      return;
    }
    
    if (data.session) {
      console.log('✅ User is logged in:', {
        userId: data.session.user.id,
        email: data.session.user.email,
        expiresAt: new Date(data.session.expires_at * 1000).toLocaleString()
      });
      return data.session;
    } else {
      console.log('❌ No active session found. User is not logged in.');
      return null;
    }
  },
  
  // Try to sign in with test credentials
  tryTestLogin: async function() {
    if (!window.supabase) {
      console.error('Error: Supabase client not found');
      return;
    }
    
    const credentials = {
      email: 'player@example.com',
      password: '123456'
    };
    
    console.log(`Attempting to sign in with email: ${credentials.email}`);
    
    try {
      const { data, error } = await window.supabase.auth.signInWithPassword(credentials);
      
      if (error) {
        console.error('❌ Login failed:', error);
        return null;
      }
      
      console.log('✅ Login successful!', {
        userId: data.user.id,
        email: data.user.email
      });
      
      return data;
    } catch (err) {
      console.error('Unexpected error during login:', err);
      return null;
    }
  },
  
  // Check if test user exists in the users table
  checkUserData: async function(userId) {
    if (!window.supabase) {
      console.error('Error: Supabase client not found');
      return;
    }
    
    if (!userId) {
      console.log('No user ID provided. Trying to get from session...');
      const session = await this.checkSession();
      userId = session?.user?.id;
      
      if (!userId) {
        console.error('No user ID available. Please sign in first.');
        return;
      }
    }
    
    console.log(`Checking user data for ID: ${userId}`);
    
    try {
      const { data, error } = await window.supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();
        
      if (error) {
        console.error('❌ Error fetching user data:', error);
        return null;
      }
      
      if (data) {
        console.log('✅ User data found:', data);
        return data;
      } else {
        console.log('❌ No user data found in users table.');
        return null;
      }
    } catch (err) {
      console.error('Unexpected error checking user data:', err);
      return null;
    }
  },
  
  // Create test user data if not exists
  createTestUserData: async function(userId) {
    if (!window.supabase) {
      console.error('Error: Supabase client not found');
      return;
    }
    
    if (!userId) {
      console.log('No user ID provided. Trying to get from session...');
      const session = await this.checkSession();
      userId = session?.user?.id;
      
      if (!userId) {
        console.error('No user ID available. Please sign in first.');
        return;
      }
    }
    
    const userData = {
      id: userId,
      name: 'Test Player',
      account_type: 'player',
      country: 'egypt',
      email: 'player@example.com',
      phone: '+201234567890',
      agree_to_terms: true
    };
    
    console.log('Attempting to create user data:', userData);
    
    try {
      // First try update in case record exists but is incomplete
      const { data: updateData, error: updateError } = await window.supabase
        .from('users')
        .update(userData)
        .eq('id', userId)
        .select();
        
      if (updateError) {
        // If update failed, try insert
        console.log('Update failed, trying insert:', updateError);
        const { data: insertData, error: insertError } = await window.supabase
          .from('users')
          .insert([userData])
          .select();
          
        if (insertError) {
          console.error('❌ Error creating user data:', insertError);
          return null;
        }
        
        console.log('✅ User data inserted:', insertData);
        return insertData;
      }
      
      console.log('✅ User data updated:', updateData);
      return updateData;
    } catch (err) {
      console.error('Unexpected error creating user data:', err);
      return null;
    }
  },
  
  // Reset password for the test account
  resetTestPassword: async function() {
    if (!window.supabase) {
      console.error('Error: Supabase client not found');
      return;
    }
    
    const email = 'player@example.com';
    console.log(`Sending password reset email to ${email}...`);
    
    try {
      const { data, error } = await window.supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + '/auth/reset-password'
      });
      
      if (error) {
        console.error('❌ Error sending password reset:', error);
        return;
      }
      
      console.log('✅ Password reset email sent successfully!');
      return data;
    } catch (err) {
      console.error('Unexpected error resetting password:', err);
      return null;
    }
  }
};

// Usage information
console.log(`
=== HAGZZ GO Auth Debug Tool ===
Available commands:

1. Check your current session:
   authDebug.checkSession()

2. Try logging in with test account:
   authDebug.tryTestLogin()

3. Check if your user data exists:
   authDebug.checkUserData()

4. Create/update test user data:
   authDebug.createTestUserData()

5. Reset test account password:
   authDebug.resetTestPassword()
`); 