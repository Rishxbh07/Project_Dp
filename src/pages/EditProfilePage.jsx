import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Camera, Image as ImageIcon, Trash2 } from 'lucide-react';
import BottomSheetModal from '../components/common/BottomSheetModal'; // <-- IMPORT

const EditProfilePage = ({ session }) => {
  const user = session?.user;
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const fileInputRef = useRef(null);

  const profile = {
    username: user?.user_metadata?.username || 'dapbuddy_user',
    fullName: user?.user_metadata?.full_name || 'Lewis Mariyati',
    phone: '+9181218991001',
    email: user?.email,
    dob: '',
    address: 'Pattimura Road 12, Sukomoro Regency'
  };

  const handleChangePhoto = () => {
    fileInputRef.current.click();
  };
  
  const handleRemovePhoto = () => {
    console.log("Remove photo logic here.");
    setIsSheetOpen(false);
  };
  
  const onFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      console.log("Selected file:", file.name);
      // Here you would add your logic to upload the file to Supabase Storage
    }
    setIsSheetOpen(false);
  };

  return (
    <>
      <div className="bg-gradient-to-br from-slate-900 to-slate-900 min-h-screen font-sans text-white">
        <header className="sticky top-0 z-20 backdrop-blur-xl bg-slate-900/80 border-b border-white/10">
          <div className="max-w-md mx-auto px-4 py-4 flex justify-between items-center">
            <Link to="/profile" className="text-purple-400 hover:text-purple-300 transition-colors">
              &larr; Back
            </Link>
            <h1 className="text-xl font-bold">Edit Profile</h1>
            <div className="w-16"></div>
          </div>
        </header>

        <main className="max-w-md mx-auto px-4 py-6">
          <section className="flex justify-center mb-8">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold text-4xl">
                {profile.username.charAt(0).toUpperCase()}
              </div>
              <button 
                onClick={() => setIsSheetOpen(true)}
                className="absolute bottom-0 right-0 w-8 h-8 bg-slate-700 rounded-full flex items-center justify-center border-2 border-slate-900 hover:bg-slate-600"
              >
                <Camera className="w-4 h-4 text-white" />
              </button>
            </div>
          </section>

          <form className="space-y-6 pb-12">
            {/* Form inputs remain the same... */}
            <div>
              <label className="text-sm font-medium text-slate-400">Username</label>
              <input type="text" value={profile.username} disabled className="w-full p-3 mt-1 bg-slate-800/50 text-slate-300 rounded-lg border border-slate-700 cursor-not-allowed" />
            </div>
            <div>
              <label htmlFor="fullName" className="text-sm font-medium text-slate-400">Fullname</label>
              <input id="fullName" type="text" defaultValue={profile.fullName} className="w-full p-3 mt-1 bg-slate-800/50 text-white rounded-lg border border-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-500" />
            </div>
            <div>
              <label htmlFor="phone" className="text-sm font-medium text-slate-400">Phone Number</label>
              <input id="phone" type="tel" defaultValue={profile.phone} className="w-full p-3 mt-1 bg-slate-800/50 text-white rounded-lg border border-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-500" />
            </div>
            <div>
              <label htmlFor="email" className="text-sm font-medium text-slate-400">Email Address</label>
              <input id="email" type="email" defaultValue={profile.email} className="w-full p-3 mt-1 bg-slate-800/50 text-white rounded-lg border border-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-500" />
            </div>
            <div>
              <label htmlFor="dob" className="text-sm font-medium text-slate-400">Date of Birth</label>
              <input id="dob" type="date" defaultValue={profile.dob} className="w-full p-3 mt-1 bg-slate-800/50 text-white rounded-lg border border-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-500" />
            </div>
            <div>
              <label htmlFor="address" className="text-sm font-medium text-slate-400">Address</label>
              <textarea id="address" rows="3" defaultValue={profile.address} className="w-full p-3 mt-1 bg-slate-800/50 text-white rounded-lg border border-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-500"></textarea>
            </div>
            
            <button type="submit" className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold py-4 rounded-2xl hover:scale-105 transition-transform">
              Save Changes
            </button>
          </form>
        </main>
      </div>

      {/* --- BOTTOM SHEET FOR PHOTO OPTIONS --- */}
      <BottomSheetModal isOpen={isSheetOpen} onClose={() => setIsSheetOpen(false)}>
        <div className="p-2 space-y-2">
          <h3 className="text-lg font-bold text-center text-white mb-4">Profile Photo</h3>
          <button 
            onClick={handleChangePhoto}
            className="w-full flex items-center gap-4 text-left p-4 rounded-xl hover:bg-slate-700 transition-colors"
          >
            <ImageIcon className="w-5 h-5 text-purple-400" />
            <span className="font-semibold text-slate-200">Change Photo</span>
          </button>
          <button
            onClick={handleRemovePhoto}
            className="w-full flex items-center gap-4 text-left p-4 rounded-xl hover:bg-slate-700 transition-colors"
          >
            <Trash2 className="w-5 h-5 text-red-400" />
            <span className="font-semibold text-red-400">Remove Photo</span>
          </button>
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