import { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Avatar,
  Typography,
  IconButton,
  CircularProgress,
} from '@mui/material';
import { PhotoCamera as PhotoCameraIcon } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { toast } from 'react-toastify';
import { uploadImage } from '../config/cloudinary';

interface ProfileData {
  username: string;
  firstName: string;
  lastName: string;
  photoURL: string | null;
}

export default function ProfileEdit() {
  const { currentUser, updateUserProfile } = useAuth();
  const [profileData, setProfileData] = useState<ProfileData>({
    username: '',
    firstName: '',
    lastName: '',
    photoURL: null,
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!currentUser) return;
      
      try {
        const userRef = doc(db, 'users', currentUser.uid);
        const userSnap = await getDoc(userRef);
        const userData = userSnap.data();
        
        if (userData) {
          setProfileData({
            username: userData.username || '',
            firstName: userData.firstName || '',
            lastName: userData.lastName || '',
            photoURL: userData.photoURL || null,
          });
          if (userData.photoURL) {
            setPreviewUrl(userData.photoURL);
          }
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        toast.error('Failed to load profile data');
      }
    };

    fetchUserData();
  }, [currentUser]);

  const handleImageUpload = async (): Promise<string | null> => {
    if (!imageFile) return null;
    
    try {
      setUploading(true);
      const imageUrl = await uploadImage(imageFile);
      return imageUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image. Please try again.');
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    try {
      setSaving(true);
      let photoURL = profileData.photoURL || undefined;

      if (imageFile) {
        const uploadedPhotoURL = await handleImageUpload();
        if (uploadedPhotoURL) {
          photoURL = uploadedPhotoURL;
          console.log('Uploaded photo URL:', photoURL); // Debug log
          
          // Update Firestore document with new photo URL
          const userRef = doc(db, 'users', currentUser.uid);
          await updateDoc(userRef, {
            photoURL: uploadedPhotoURL,
          });

          // Update Auth profile
          await updateUserProfile({ photoURL: uploadedPhotoURL });
        } else {
          setSaving(false);
          return;
        }
      }

      // Update Firestore document with additional fields
      const userRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userRef, {
        firstName: profileData.firstName,
        lastName: profileData.lastName,
      });

      // Update local state
      setProfileData(prev => ({
        ...prev,
        photoURL: photoURL || null,
      }));

      toast.success('Profile updated successfully');
      setImageFile(null);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }
      
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return;
      }

      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Edit Profile
      </Typography>

      <Box component="form" onSubmit={handleSubmit}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
          <Avatar
            src={previewUrl || undefined}
            sx={{ width: 100, height: 100, mr: 2 }}
          />
          <Box>
            <input
              accept="image/*"
              style={{ display: 'none' }}
              id="icon-button-file"
              type="file"
              onChange={handleImageChange}
              disabled={uploading}
            />
            <label htmlFor="icon-button-file">
              <IconButton
                color="primary"
                aria-label="upload picture"
                component="span"
                disabled={uploading}
              >
                {uploading ? <CircularProgress size={24} /> : <PhotoCameraIcon />}
              </IconButton>
            </label>
            <Typography variant="body2" color="textSecondary">
              {uploading ? 'Uploading...' : 'Click to change profile picture'}
            </Typography>
          </Box>
        </Box>

        <TextField
          fullWidth
          label="Username"
          value={profileData.username}
          margin="normal"
          disabled
          helperText="Only administrators can change usernames"
        />

        <TextField
          fullWidth
          label="First Name"
          value={profileData.firstName}
          onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
          margin="normal"
          required
        />

        <TextField
          fullWidth
          label="Last Name"
          value={profileData.lastName}
          onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
          margin="normal"
          required
        />

        <Button
          type="submit"
          variant="contained"
          color="primary"
          sx={{ mt: 3 }}
          disabled={saving || uploading}
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </Box>
    </Box>
  );
} 