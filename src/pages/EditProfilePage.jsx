import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { Camera, Image as ImageIcon, Trash2 } from 'lucide-react';
import BottomSheetModal from '../components/common/BottomSheetModal';
import AvatarOptions from '../components/common/AvatarOptions';

const EditProfilePage = ({ session }) => {
  const user = session?.user;
  const navigate = useNavigate();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const fileInputRef = useRef(null);

  // State to hold all profile data, including the new pfp_url
  const [profile, setProfile] = useState({
    username: 'loading...',
    fullName: '',
    phone: '',
    email: '',
    dob: '',
    address: '',
    pfp_url: null,
  });
  const [loading, setLoading] = useState(true);

  // Fetch all profile data when the component loads
  useEffect(() => {
    const fetchProfile = async () => {
        if (!user) return;
        setLoading(true);
        const { data, error } = await supabase
            .from('profiles')
            .select('username, pfp_url') // You can add other fields here if needed
            .eq('id', user.id)
            .single();

        if (error) {
            console.error('Error fetching profile', error);
        } else if (data) {
            setProfile(prev => ({
                ...prev,
                ...data,
                // Prefill form data from session as a fallback
                username: data.username || user?.user_metadata?.username || 'dapbuddy_user',
                fullName: user?.user_metadata?.full_name || 'Lewis Mariyati',
                phone: '+9181218991001',
                email: user?.email,
                dob: '',
                address: 'Pattimura Road 12, Sukomoro Regency'
            }));
        }
        setLoading(false);
    };
    fetchProfile();
  }, [user]);

  // Function to update the avatar URL in Supabase
  const handleAvatarSelect = async (newUrl) => {
    setIsSheetOpen(false);
    const { error } = await supabase
      .from('profiles')
      .update({ pfp_url: newUrl })
      .eq('id', user.id);

    if (error) {
      alert('Could not update your avatar. Please try again.');
    } else {
      setProfile(prev => ({ ...prev, pfp_url: newUrl }));
    }
  };

  const handleChangePhoto = () => fileInputRef.current.click();
  const handleRemovePhoto = () => handleAvatarSelect(null);

  const onFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file || !user) return;

    const filePath = `${user.id}/${Date.now()}`;
    const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file);

    if (uploadError) {
      alert('Error uploading file.');
      console.error(uploadError);
    } else {
      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
      await handleAvatarSelect(data.publicUrl);
    }
    setIsSheetOpen(false);
  };

  return (
    <>
      <div className="bg-gray-50 dark:bg-gradient-to-br dark:from-slate-900 dark:to-slate-900 min-h-screen font-sans text-gray-900 dark:text-white">
        <header className="sticky top-0 z-20 backdrop-blur-xl bg-white/80 dark:bg-slate-900/80 border-b border-gray-200 dark:border-white/10">
          <div className="max-w-md mx-auto px-4 py-4 flex justify-between items-center">
            <Link to="/profile" className="text-purple-500 dark:text-purple-400 hover:text-purple-600 dark:hover:text-purple-300 transition-colors">
              &larr; Back
            </Link>
            <h1 className="text-xl font-bold">Edit Profile</h1>
            <div className="w-16"></div>
          </div>
        </header>

        <main className="max-w-md mx-auto px-4 py-6">
          <section className="flex justify-center mb-8">
            <div className="relative">
              {/* Dynamically display the avatar */}
              {profile.pfp_url ? (
                  <img src={profile.pfp_url} alt={profile.username} className="w-24 h-24 rounded-full object-cover" />
              ) : (
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold text-4xl">
                  {profile.username ? profile.username.charAt(0).toUpperCase() : ''}
                </div>
              )}
              <button
                onClick={() => setIsSheetOpen(true)}
                className="absolute bottom-0 right-0 w-8 h-8 bg-gray-200 dark:bg-slate-700 rounded-full flex items-center justify-center border-2 border-white dark:border-slate-900 hover:bg-gray-300 dark:hover:bg-slate-600"
              >
                <Camera className="w-4 h-4 text-gray-800 dark:text-white" />
              </button>
            </div>
          </section>

          {/* The original form is preserved below */}
          <form className="space-y-6 pb-12">
            <div>
              <label className="text-sm font-medium text-gray-500 dark:text-slate-400">Username</label>
              <input type="text" value={profile.username} disabled className="w-full p-3 mt-1 bg-gray-200 dark:bg-slate-800/50 text-gray-500 dark:text-slate-300 rounded-lg border border-gray-300 dark:border-slate-700 cursor-not-allowed" />
            </div>
            <div>
              <label htmlFor="fullName" className="text-sm font-medium text-gray-500 dark:text-slate-400">Fullname</label>
              <input id="fullName" type="text" defaultValue={profile.fullName} className="w-full p-3 mt-1 bg-gray-100 dark:bg-slate-800/50 text-gray-900 dark:text-white rounded-lg border border-gray-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-500" />
            </div>
            <div>
              <label htmlFor="phone" className="text-sm font-medium text-gray-500 dark:text-slate-400">Phone Number</label>
              <input id="phone" type="tel" defaultValue={profile.phone} className="w-full p-3 mt-1 bg-gray-100 dark:bg-slate-800/50 text-gray-900 dark:text-white rounded-lg border border-gray-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-500" />
            </div>
            <div>
              <label htmlFor="email" className="text-sm font-medium text-gray-500 dark:text-slate-400">Email Address</label>
              <input id="email" type="email" defaultValue={profile.email} className="w-full p-3 mt-1 bg-gray-100 dark:bg-slate-800/50 text-gray-900 dark:text-white rounded-lg border border-gray-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-500" />
            </div>
            <div>
              <label htmlFor="dob" className="text-sm font-medium text-gray-500 dark:text-slate-400">Date of Birth</label>
              <input id="dob" type="date" defaultValue={profile.dob} className="w-full p-3 mt-1 bg-gray-100 dark:bg-slate-800/50 text-gray-900 dark:text-white rounded-lg border border-gray-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-500" />
            </div>
            <div>
              <label htmlFor="address" className="text-sm font-medium text-gray-500 dark:text-slate-400">Address</label>
              <textarea id="address" rows="3" defaultValue={profile.address} className="w-full p-3 mt-1 bg-gray-100 dark:bg-slate-800/50 text-gray-900 dark:text-white rounded-lg border border-gray-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-500"></textarea>
            </div>
            
            <button type="submit" className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold py-4 rounded-2xl hover:scale-105 transition-transform">
              Save Changes
            </button>
          </form>
        </main>
      </div>

      <BottomSheetModal isOpen={isSheetOpen} onClose={() => setIsSheetOpen(false)}>
        <div className="p-2 space-y-2">
          <h3 className="text-lg font-bold text-center text-gray-900 dark:text-white mb-4">Profile Photo</h3>
          <button
            onClick={handleChangePhoto}
            className="w-full flex items-center gap-4 text-left p-4 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
          >
            <ImageIcon className="w-5 h-5 text-purple-500 dark:text-purple-400" />
            <span className="font-semibold text-gray-800 dark:text-slate-200">Upload Photo</span>
          </button>
          <button
            onClick={handleRemovePhoto}
            className="w-full flex items-center gap-4 text-left p-4 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
          >
            <Trash2 className="w-5 h-5 text-red-500 dark:text-red-400" />
            <span className="font-semibold text-red-500 dark:text-red-400">Remove Photo</span>
          </button>

          <div className="border-t border-gray-200 dark:border-slate-700 my-2"></div>
          
          {/* Display the avatar options */}
          <AvatarOptions username={profile.username} onSelect={handleAvatarSelect} />

          <input
            type="file"
            ref={fileInputRef}
            onChange={onFileChange}
            className="hidden"
            accept="image/png, image/jpeg"
          />
        </div>
      </BottomSheetModal>
    </>
  );
};

export default EditProfilePage;