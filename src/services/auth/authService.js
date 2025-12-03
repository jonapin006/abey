import { supabase } from '../../lib/supabaseClient';

export const authService = {
    /**
     * Sign up a new user
     * @param {string} email 
     * @param {string} password 
     * @returns {Promise<{user: object|null, error: object|null}>}
     */
    signUp: async (email, password) => {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
        });

        if (error) {
            throw error;
        }

        return data;
    },

    /**
     * Sign in an existing user
     * @param {string} email 
     * @param {string} password 
     * @returns {Promise<{user: object|null, error: object|null}>}
     */
    signIn: async (email, password) => {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            throw error;
        }

        return data;
    },

    /**
     * Sign out the current user
     */
    signOut: async () => {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
    }
};
