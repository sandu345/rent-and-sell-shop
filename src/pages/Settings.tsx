
// import React, { useState } from 'react';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { useAuth } from '@/contexts/AuthContext';
// import { Eye, EyeOff } from 'lucide-react';

// export const Settings: React.FC = () => {
//   const [currentPassword, setCurrentPassword] = useState('');
//   const [newPassword, setNewPassword] = useState('');
//   const [confirmPassword, setConfirmPassword] = useState('');
//   const [showCurrentPassword, setShowCurrentPassword] = useState(false);
//   const [showNewPassword, setShowNewPassword] = useState(false);
//   const [showConfirmPassword, setShowConfirmPassword] = useState(false);
//   const [message, setMessage] = useState('');
//   const [error, setError] = useState('');
//   const { changePassword } = useAuth();

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
//     setError('');
//     setMessage('');

//     if (!currentPassword || !newPassword || !confirmPassword) {
//       setError('Please fill in all fields');
//       return;
//     }

//     if (newPassword !== confirmPassword) {
//       setError('New passwords do not match');
//       return;
//     }

//     if (newPassword.length < 6) {
//       setError('New password must be at least 6 characters long');
//       return;
//     }

//     const success = changePassword(currentPassword, newPassword);
//     if (success) {
//       setMessage('Password changed successfully');
//       setCurrentPassword('');
//       setNewPassword('');
//       setConfirmPassword('');
//     } else {
//       setError('Current password is incorrect');
//     }
//   };

//   return (
//     <div className="max-w-2xl mx-auto p-6">
//       <Card>
//         <CardHeader>
//           <CardTitle>Account Settings</CardTitle>
//         </CardHeader>
//         <CardContent>
//           <form onSubmit={handleSubmit} className="space-y-4">
//             <div className="space-y-2">
//               <Label htmlFor="currentPassword">Current Password</Label>
//               <div className="relative">
//                 <Input
//                   id="currentPassword"
//                   type={showCurrentPassword ? 'text' : 'password'}
//                   value={currentPassword}
//                   onChange={(e) => setCurrentPassword(e.target.value)}
//                   required
//                 />
//                 <Button
//                   type="button"
//                   variant="ghost"
//                   size="icon"
//                   className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
//                   onClick={() => setShowCurrentPassword(!showCurrentPassword)}
//                 >
//                   {showCurrentPassword ? (
//                     <EyeOff className="h-4 w-4" />
//                   ) : (
//                     <Eye className="h-4 w-4" />
//                   )}
//                 </Button>
//               </div>
//             </div>

//             <div className="space-y-2">
//               <Label htmlFor="newPassword">New Password</Label>
//               <div className="relative">
//                 <Input
//                   id="newPassword"
//                   type={showNewPassword ? 'text' : 'password'}
//                   value={newPassword}
//                   onChange={(e) => setNewPassword(e.target.value)}
//                   required
//                 />
//                 <Button
//                   type="button"
//                   variant="ghost"
//                   size="icon"
//                   className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
//                   onClick={() => setShowNewPassword(!showNewPassword)}
//                 >
//                   {showNewPassword ? (
//                     <EyeOff className="h-4 w-4" />
//                   ) : (
//                     <Eye className="h-4 w-4" />
//                   )}
//                 </Button>
//               </div>
//             </div>

//             <div className="space-y-2">
//               <Label htmlFor="confirmPassword">Confirm New Password</Label>
//               <div className="relative">
//                 <Input
//                   id="confirmPassword"
//                   type={showConfirmPassword ? 'text' : 'password'}
//                   value={confirmPassword}
//                   onChange={(e) => setConfirmPassword(e.target.value)}
//                   required
//                 />
//                 <Button
//                   type="button"
//                   variant="ghost"
//                   size="icon"
//                   className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
//                   onClick={() => setShowConfirmPassword(!showConfirmPassword)}
//                 >
//                   {showConfirmPassword ? (
//                     <EyeOff className="h-4 w-4" />
//                   ) : (
//                     <Eye className="h-4 w-4" />
//                   )}
//                 </Button>
//               </div>
//             </div>

//             {error && (
//               <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
//                 {error}
//               </div>
//             )}

//             {message && (
//               <div className="text-sm text-green-600 bg-green-50 p-2 rounded">
//                 {message}
//               </div>
//             )}

//             <Button type="submit">
//               Change Password
//             </Button>
//           </form>
//         </CardContent>
//       </Card>
//     </div>
//   );
// };


import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { Eye, EyeOff, AlertCircle, CheckCircle, Info, LogOut } from 'lucide-react';

export const Settings: React.FC = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { changePassword, user , logout } = useAuth();

  // Password strength validation
  const validatePassword = (password: string) => {
    const requirements = [
      { test: password.length >= 8, text: 'At least 8 characters' },
      // { test: /[a-z]/.test(password), text: 'One lowercase letter' },
      // { test: /[A-Z]/.test(password), text: 'One uppercase letter' },
      // { test: /\d/.test(password), text: 'One number' },
      // { test: /[@$!%*?&]/.test(password), text: 'One special character (@$!%*?&)' }
    ];
    
    return requirements;
  };

  const passwordRequirements = validatePassword(newPassword);
  const isPasswordValid = passwordRequirements.every(req => req.test);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setIsLoading(true);

    // Validation
    if (!currentPassword || !newPassword || !confirmPassword) {
      setError('Please fill in all fields');
      setIsLoading(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      setIsLoading(false);
      return;
    }

    if (!isPasswordValid) {
      setError('Password does not meet security requirements');
      setIsLoading(false);
      return;
    }

    if (currentPassword === newPassword) {
      setError('New password must be different from current password');
      setIsLoading(false);
      return;
    }

    try {
      // Call the async changePassword function
      const result = await changePassword(currentPassword, newPassword);
      
      if (result.success) {
        setMessage('Password changed successfully');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');

 setTimeout(() => {
    logout();
  }, 1000); // 1000ms = 1 second
      } else {
        setError(result.message || 'Failed to change password');
      }
    } catch (error) {
      setError('An unexpected error occurred');
      console.error('Password change error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Account Settings</CardTitle>
          {user && (
            <p className="text-sm text-muted-foreground">
              Signed in as: {user.email}
            </p>
          )}
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Current Password */}
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current Password</Label>
              <div className="relative">
                <Input
                  id="currentPassword"
                  type={showCurrentPassword ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter your current password"
                  required
                  autoComplete="current-password"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                >
                  {showCurrentPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            {/* New Password */}
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter your new password"
                  required
                  autoComplete="new-password"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
              
              {/* Password Requirements */}
              {newPassword && (
                <div className="mt-2 p-3 bg-gray-50 rounded-md">
                  <div className="flex items-center gap-2 mb-2">
                    <Info className="h-4 w-4 text-blue-500" />
                    <span className="text-sm font-medium">Password Requirements:</span>
                  </div>
                  <ul className="space-y-1">
                    {passwordRequirements.map((req, index) => (
                      <li key={index} className="flex items-center gap-2 text-sm">
                        {req.test ? (
                          <CheckCircle className="h-3 w-3 text-green-500" />
                        ) : (
                          <AlertCircle className="h-3 w-3 text-red-500" />
                        )}
                        <span className={req.test ? 'text-green-700' : 'text-red-700'}>
                          {req.text}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your new password"
                  required
                  autoComplete="new-password"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
              
              {/* Password Match Indicator */}
              {confirmPassword && (
                <div className="flex items-center gap-2 text-sm mt-1">
                  {newPassword === confirmPassword ? (
                    <>
                      <CheckCircle className="h-3 w-3 text-green-500" />
                      <span className="text-green-700">Passwords match</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="h-3 w-3 text-red-500" />
                      <span className="text-red-700">Passwords do not match</span>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-3 rounded-md">
                <AlertCircle className="h-4 w-4" />
                {error}
              </div>
            )}

            {/* Success Message */}
            {message && (
              <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 p-3 rounded-md">
                <CheckCircle className="h-4 w-4" />
                {message}
              </div>
            )}

            {/* Submit Button */}
            <Button 
              type="submit" 
              disabled={isLoading || !isPasswordValid || newPassword !== confirmPassword}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Changing Password...
                </>
              ) : (
                'Change Password'
              )}
            </Button>
          </form>

          {/* Security Tips */}
          <div className="mt-6 p-4 bg-blue-50 rounded-md">
            <h4 className="font-medium text-blue-900 mb-2">Security Tips:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Use a unique password that you don't use elsewhere</li>
              <li>• Consider using a password manager</li>
              <li>• Change your password regularly</li>
              <li>• Never share your password with anyone</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};