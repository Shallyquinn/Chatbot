import React, { useState } from 'react';
import { User, Edit2, Camera, X, CheckCircle } from 'lucide-react';
import type { AdminProfile, UpdateAdminProfileDto } from '../../types/admin';
import adminApi from '../../services/adminApi';

interface ProfileSectionProps {
  profile: AdminProfile;
  onProfileUpdate: (profile: AdminProfile) => void;
  onNotification: (message: string, type: 'success' | 'error') => void;
}

const ProfileSection: React.FC<ProfileSectionProps> = ({
  profile,
  onProfileUpdate,
  onNotification,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: profile.name,
    email: profile.email,
    profileImage: profile.profileImage || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleEditClick = () => {
    setFormData({
      name: profile.name,
      email: profile.email,
      profileImage: profile.profileImage || '',
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
    setShowModal(true);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        onNotification('Image size must be less than 2MB', 'error');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({
          ...prev,
          profileImage: reader.result as string,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.name.trim()) {
      onNotification('Name is required', 'error');
      return;
    }
    if (!formData.email.trim()) {
      onNotification('Email is required', 'error');
      return;
    }
    if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
      onNotification('Passwords do not match', 'error');
      return;
    }
    if (formData.newPassword && !formData.currentPassword) {
      onNotification('Current password is required to set new password', 'error');
      return;
    }

    setIsLoading(true);
    try {
      const updateData: UpdateAdminProfileDto = {
        name: formData.name,
        email: formData.email,
        profileImage: formData.profileImage || null,
      };

      if (formData.newPassword) {
        updateData.currentPassword = formData.currentPassword;
        updateData.newPassword = formData.newPassword;
      }

      const response = await adminApi.updateAdminProfile(updateData);
      onProfileUpdate(response.admin);
      setShowModal(false);
      onNotification('Profile updated successfully!', 'success');

      if (formData.email !== profile.email) {
        onNotification('Login email updated. Please re-login with new email.', 'success');
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update profile';
      onNotification(errorMessage, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Profile Display */}
      <div className="mt-6 px-5">
        <div className="relative group">
          <div className="bg-gradient-to-br from-[#006045] to-[#004d35] relative rounded-full w-20 h-20 mx-auto shadow-md ring-2 ring-white flex items-center justify-center overflow-hidden">
            {profile.profileImage ? (
              <img
                src={profile.profileImage}
                alt={profile.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="w-10 h-10 text-white" strokeWidth={2} />
            )}
          </div>
          <button
            onClick={handleEditClick}
            className="absolute bottom-0 right-1/2 transform translate-x-1/2 translate-y-1/2 bg-white rounded-full p-1.5 shadow-lg hover:bg-gray-50 transition-all opacity-0 group-hover:opacity-100"
            title="Edit Profile"
          >
            <Edit2 className="w-3 h-3 text-[#006045]" />
          </button>
        </div>
        <div className="mt-4 text-center">
          <p className="font-bold text-[#1e1e1e] text-lg">{profile.name}</p>
          <p className="font-medium text-[#7b7b7b] text-xs mt-1">{profile.email}</p>
          <p className="text-[10px] text-[#989898] mt-1 uppercase tracking-wide">{profile.role}</p>
        </div>
      </div>

      {/* Edit Modal */}
      {showModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
          onClick={(e) => {
            if (e.target === e.currentTarget && !isLoading) {
              setShowModal(false);
            }
          }}
        >
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white">
              <h3 className="text-lg font-bold text-[#1e1e1e]">Edit Profile</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
                disabled={isLoading}
                aria-label="Close edit profile modal"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="px-6 py-4 space-y-4">
              {/* Profile Image */}
              <div className="flex flex-col items-center">
                <div className="relative group">
                  <div className="w-24 h-24 rounded-full overflow-hidden bg-gradient-to-br from-[#006045] to-[#004d35] flex items-center justify-center">
                    {formData.profileImage ? (
                      <img
                        src={formData.profileImage}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-12 h-12 text-white" />
                    )}
                  </div>
                  <label
                    htmlFor="image-upload"
                    className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    aria-label="Upload profile image"
                  >
                    <Camera className="w-6 h-6 text-white" />
                  </label>
                  <input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    disabled={isLoading}
                    aria-label="Upload profile image file"
                    title="Upload profile image"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">Click to upload (Max 2MB)</p>
              </div>

              {/* Name */}
              <div>
                <label htmlFor="profile-name" className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  id="profile-name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#006045]"
                  disabled={isLoading}
                  placeholder="Enter your name"
                  title="Profile name"
                />
              </div>

              {/* Email */}
              <div>
                <label htmlFor="profile-email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email (Login Email)
                </label>
                <input
                  id="profile-email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#006045]"
                  disabled={isLoading}
                  placeholder="Enter your email"
                  title="Login email address"
                />
                <p className="text-xs text-amber-600 mt-1">
                  ⚠️ Changing this will update your login email
                </p>
              </div>

              {/* Password Section */}
              <div className="pt-4 border-t border-gray-200">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">Change Password (Optional)</h4>
                
                <div className="space-y-3">
                  <div>
                    <label htmlFor="current-password" className="block text-sm font-medium text-gray-700 mb-1">
                      Current Password
                    </label>
                    <input
                      id="current-password"
                      type="password"
                      value={formData.currentPassword}
                      onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#006045]"
                      disabled={isLoading}
                      placeholder="Enter current password"
                      title="Current password"
                    />
                  </div>

                  <div>
                    <label htmlFor="new-password" className="block text-sm font-medium text-gray-700 mb-1">
                      New Password
                    </label>
                    <input
                      id="new-password"
                      type="password"
                      value={formData.newPassword}
                      onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#006045]"
                      disabled={isLoading}
                      placeholder="Enter new password"
                      title="New password"
                    />
                  </div>

                  <div>
                    <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 mb-1">
                      Confirm New Password
                    </label>
                    <input
                      id="confirm-password"
                      type="password"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#006045]"
                      disabled={isLoading}
                      placeholder="Confirm new password"
                      title="Confirm new password"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={isLoading}
                className="px-4 py-2 bg-[#006045] text-white rounded-lg hover:bg-[#005038] transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProfileSection;
