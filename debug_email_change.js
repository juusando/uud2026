import PocketBase from 'pocketbase';

const pb = new PocketBase('https://pb06.uud.io/');

// Test with a dummy login first
async function testEmailChange() {
  try {
    console.log('Testing email change functionality...');
    
    // Try to get current auth state
    console.log('Auth store valid:', pb.authStore.isValid);
    console.log('Current user:', pb.authStore.model);
    
    if (!pb.authStore.isValid) {
      console.log('No authenticated user found');
      return;
    }
    
    // Try to request email change with a test email
    const testEmail = 'test-new-email@example.com';
    console.log('Attempting to change email to:', testEmail);
    
    const result = await pb.collection('users').requestEmailChange(testEmail);
    console.log('Success:', result);
    
  } catch (error) {
    console.error('Detailed error analysis:');
    console.error('Status:', error.status);
    console.error('Message:', error.message);
    console.error('Data:', JSON.stringify(error.data, null, 2));
    console.error('Response:', JSON.stringify(error.response, null, 2));
    
    // Check if it's a validation error
    if (error.data && error.data.data) {
      console.error('Validation errors:');
      Object.entries(error.data.data).forEach(([field, errors]) => {
        console.error(`  ${field}:`, errors);
      });
    }
  }
}

testEmailChange();
