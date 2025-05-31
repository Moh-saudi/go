// Supabase client disabled
export const supabase = {
  storage: {
    from: () => ({
      upload: async () => { throw new Error('Supabase is disabled'); },
      getPublicUrl: () => { throw new Error('Supabase is disabled'); },
      remove: async () => { throw new Error('Supabase is disabled'); }
    })
  },
  auth: {
    getUser: async () => { throw new Error('Supabase is disabled'); }
  }
};