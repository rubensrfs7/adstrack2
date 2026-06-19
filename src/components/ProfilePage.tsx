
import React, { useState, useEffect } from 'react';
import { 
  User, Building2, Lock, Camera, Save, Mail, Upload
} from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { UserProfile } from '../types';

const ProfilePage: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Passwords
  const [passwords, setPasswords] = useState({
    new: '',
    confirm: ''
  });

  // UI Feedback
  const [isSavingUser, setIsSavingUser] = useState(false);
  const [isSavingCompany, setIsSavingCompany] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
        // MOCK DATA PROFILE
        if (!isSupabaseConfigured) {
            setProfile({
                id: 'demo-user-id',
                email: 'rubens.rfs7@gmail.com',
                full_name: 'Rubens Ferreira',
                avatar_url: 'https://v4d.mz-css.net/f192fb8aa8790d64369e5db4e8d5b363/c80f08d7e4d3cf1cbceade0aed441b7c/Rubens_Ferreira.jpg',
                company_name: 'AdsTrack',
                company_logo_url: '',
                role: 'Admin',
                invitation_code: 'DEMO-1234'
            });
            setLoading(false);
            return;
        }

        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

        if (error && error.code !== 'PGRST116') throw error; // PGRST116 is no rows found

        if (data) {
            setProfile(data);
        } else {
            // Se não existir perfil, usamos dados da sessão
            setProfile({
                id: session.user.id,
                email: session.user.email!,
                full_name: 'Rubens Ferreira',
                avatar_url: 'https://v4d.mz-css.net/f192fb8aa8790d64369e5db4e8d5b363/c80f08d7e4d3cf1cbceade0aed441b7c/Rubens_Ferreira.jpg',
                company_name: 'AdsTrack',
                company_logo_url: '',
                role: 'user',
                invitation_code: 'GERANDO...'
            });
        }
    } catch (error) {
        console.error('Error fetching profile:', error);
    } finally {
        setLoading(false);
    }
  };

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (profile) {
        setProfile({ ...profile, [e.target.name]: e.target.value });
    }
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && profile) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfile({ ...profile, avatar_url: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && profile) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfile({ ...profile, company_logo_url: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswords({ ...passwords, [e.target.name]: e.target.value });
  };

  const saveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setIsSavingUser(true);

    if (!isSupabaseConfigured) {
        setTimeout(() => {
            setIsSavingUser(false);
            alert('Perfil atualizado (Simulação)!');
        }, 800);
        return;
    }

    try {
        const { error } = await supabase
            .from('profiles')
            .upsert({
                id: profile.id,
                email: profile.email,
                full_name: profile.full_name,
                avatar_url: profile.avatar_url
            });

        if (error) throw error;
        
        // Update password if fields are filled
        if (passwords.new && passwords.new === passwords.confirm) {
            const { error: passError } = await supabase.auth.updateUser({ password: passwords.new });
            if (passError) throw passError;
            setPasswords({ new: '', confirm: '' });
            alert('Perfil e senha atualizados!');
        } else if (passwords.new) {
            alert('As senhas não conferem.');
        } else {
            alert('Perfil atualizado com sucesso!');
        }

    } catch (error) {
        console.error('Error saving profile:', error);
        alert('Erro ao salvar perfil.');
    } finally {
        setIsSavingUser(false);
    }
  };

  const saveCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setIsSavingCompany(true);

    if (!isSupabaseConfigured) {
        setTimeout(() => {
            setIsSavingCompany(false);
            alert('Empresa atualizada (Simulação)!');
        }, 800);
        return;
    }

    try {
        const { error } = await supabase
            .from('profiles')
            .update({
                company_name: profile.company_name,
                company_logo_url: profile.company_logo_url
            })
            .eq('id', profile.id);

        if (error) throw error;
        alert('Dados da empresa atualizados!');
    } catch (error) {
        console.error('Error saving company:', error);
        alert('Erro ao salvar dados da empresa.');
    } finally {
        setIsSavingCompany(false);
    }
  };

  if (loading || !profile) {
      return <div className="flex justify-center py-20">Carregando...</div>;
  }

  return (
    <div className="space-y-8 pb-20 max-w-4xl mx-auto">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center justify-center gap-2">
          <User className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          Meu Perfil e Configurações
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Gerencie suas informações pessoais e da sua organização.</p>
      </div>

      <div className="space-y-8">
        
        {/* Personal Info & Password */}
        <div className="space-y-8">
          
          {/* Personal Info Card */}
          <section className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
            <div className="p-6 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 flex justify-between items-center">
              <h3 className="font-semibold text-gray-800 dark:text-white flex items-center gap-2">
                <User className="w-4 h-4" /> Informações Pessoais
              </h3>
            </div>
            
            <form onSubmit={saveUser} className="p-6 space-y-6">
              <div className="flex flex-col sm:flex-row gap-6 items-start">
                
                {/* Avatar Upload */}
                <div className="flex flex-col items-center gap-3">
                  <div className="relative group">
                    <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-gray-100 dark:border-gray-700 shadow-sm bg-gray-200">
                      <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                    </div>
                    <label className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded-full text-white">
                      <Camera className="w-6 h-6" />
                      <input type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} />
                    </label>
                  </div>
                  <span className="text-xs text-gray-500">JPG ou PNG</span>
                </div>

                {/* Fields */}
                <div className="flex-1 w-full space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nome Completo</label>
                      <input 
                        type="text" 
                        name="full_name"
                        value={profile.full_name || ''}
                        onChange={handleProfileChange}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">E-mail</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                        <input 
                          type="email" 
                          name="email"
                          value={profile.email}
                          disabled
                          className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 text-gray-500 cursor-not-allowed outline-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Password Section */}
              <div className="border-t border-gray-100 dark:border-gray-800 pt-6">
                <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
                  <Lock className="w-3 h-3" /> Alterar Senha
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Nova Senha</label>
                    <input 
                      type="password"
                      name="new"
                      value={passwords.new}
                      onChange={handlePasswordChange}
                      className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Confirmar Senha</label>
                    <input 
                      type="password"
                      name="confirm"
                      value={passwords.confirm}
                      onChange={handlePasswordChange}
                      className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button 
                  type="submit" 
                  disabled={isSavingUser}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium shadow-lg shadow-blue-200 dark:shadow-none transition-all flex items-center gap-2 disabled:opacity-70"
                >
                  {isSavingUser ? 'Salvando...' : <><Save className="w-4 h-4" /> Salvar Alterações</>}
                </button>
              </div>
            </form>
          </section>

           {/* Company Info Card */}
           <section className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
            <div className="p-6 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
              <h3 className="font-semibold text-gray-800 dark:text-white flex items-center gap-2">
                <Building2 className="w-4 h-4" /> Dados da Empresa
              </h3>
            </div>
            
            <form onSubmit={saveCompany} className="p-6 space-y-6">
              <div className="flex flex-col sm:flex-row gap-6 items-center">
                 {/* Logo Upload */}
                 <div className="flex-shrink-0">
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-2 text-center">Logo da Marca</label>
                    <label className="flex flex-col items-center justify-center w-32 h-32 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg hover:border-blue-500 cursor-pointer bg-gray-50 dark:bg-gray-800/30 transition-all">
                        {profile.company_logo_url ? (
                            <img src={profile.company_logo_url} alt="Logo" className="w-full h-full object-contain p-2" />
                        ) : (
                            <div className="text-center text-gray-400">
                                <Upload className="w-8 h-8 mx-auto mb-1" />
                                <span className="text-[10px]">Upload</span>
                            </div>
                        )}
                        <input type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} />
                    </label>
                 </div>

                 <div className="flex-1 w-full">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nome da Empresa</label>
                    <input 
                        type="text" 
                        name="company_name"
                        value={profile.company_name || ''}
                        onChange={handleProfileChange}
                        placeholder="Ex: Minha Agência Digital"
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                 </div>
              </div>

              <div className="flex justify-end pt-2">
                <button 
                  type="submit" 
                  disabled={isSavingCompany}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium shadow-lg shadow-blue-200 dark:shadow-none transition-all flex items-center gap-2 disabled:opacity-70"
                >
                  {isSavingCompany ? 'Salvando...' : <><Save className="w-4 h-4" /> Atualizar Empresa</>}
                </button>
              </div>
            </form>
           </section>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
