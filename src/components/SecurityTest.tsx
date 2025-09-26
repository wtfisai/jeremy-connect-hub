import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

/**
 * Security Test Component - Used to verify email address exposure is fixed
 * This component should NOT be used in production - it's for security testing only
 */
const SecurityTest = () => {
  const [profileData, setProfileData] = useState<any[]>([]);
  const [error, setError] = useState<string>('');
  const { user } = useAuth();
  
  useEffect(() => {
    const testProfileAccess = async () => {
      try {
        // This should now be restricted - emails should not be accessible to unauthorized users
        const { data, error } = await supabase
          .from('profiles')
          .select('user_id, full_name, email')
          .limit(5);
          
        if (error) {
          setError(`Access properly restricted: ${error.message}`);
        } else {
          // Check if emails are being returned
          const hasEmails = data?.some(profile => profile.email);
          if (hasEmails && !user) {
            setError('SECURITY ISSUE: Emails accessible without authentication!');
          } else if (hasEmails && user) {
            setError('Emails accessible with authentication (this may be expected)');
          } else {
            setError('Emails properly protected from unauthorized access');
          }
          setProfileData(data || []);
        }
      } catch (err) {
        setError(`Access restricted: ${err}`);
      }
    };
    
    testProfileAccess();
  }, [user]);
  
  // Only show in development mode
  if (process.env.NODE_ENV === 'production') {
    return null;
  }
  
  return (
    <div style={{ 
      position: 'fixed', 
      bottom: '10px', 
      right: '10px', 
      background: 'rgba(0,0,0,0.8)', 
      color: 'white', 
      padding: '10px', 
      borderRadius: '5px',
      fontSize: '12px',
      maxWidth: '300px',
      zIndex: 9999
    }}>
      <strong>Security Test:</strong><br/>
      Status: {user ? 'Authenticated' : 'Not Authenticated'}<br/>
      Result: {error}<br/>
      Profiles Found: {profileData.length}<br/>
      Emails Visible: {profileData.filter(p => p.email).length}
    </div>
  );
};

export default SecurityTest;