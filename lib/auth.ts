import { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import { supabaseAdmin } from '@/lib/db';
import crypto from 'crypto';

export const authOptions: NextAuthOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }),
        CredentialsProvider({
            name: 'Email',
            credentials: {
                email: { label: 'Email', type: 'email' },
                password: { label: 'Password', type: 'password' }
            },
            async authorize(credentials) {
                console.log('Login attempt for:', credentials?.email);
                if (!credentials?.email || !credentials?.password) {
                    console.log('Missing credentials');
                    return null;
                }

                try {
                    const { data: user, error } = await supabaseAdmin
                        .from('users')
                        .select('*')
                        .eq('email', credentials.email)
                        .single();

                    if (error) {
                        console.error('Database error during login:', error.message);
                        return null;
                    }

                    if (!user) {
                        console.log('User not found in database');
                        return null;
                    }

                    // Verify password hash
                    const passwordHash = crypto
                        .createHash('sha256')
                        .update(credentials.password)
                        .digest('hex');

                    if (user.password_hash !== passwordHash) {
                        console.log('Password mismatch');
                        return null;
                    }

                    console.log('Login successful for:', user.email);
                    return {
                        id: user.id,
                        email: user.email,
                        name: user.name,
                        role: user.role,
                        image: user.avatar_url
                    };
                } catch (err: any) {
                    console.error('Unexpected error during authorize:', err.message);
                    return null;
                }
            }
        })
    ],
    callbacks: {
        async signIn({ user, account }) {
            if (account?.provider === 'google') {
                const { data: existingUser } = await supabaseAdmin
                    .from('users')
                    .select('*')
                    .eq('email', user.email!)
                    .single();

                if (!existingUser) {
                    await supabaseAdmin
                        .from('users')
                        .insert({
                            email: user.email,
                            name: user.name,
                            avatar_url: user.image,
                            role: 'client',
                            verified: true,
                            status: 'active'
                        });
                }
            }
            return true;
        },
        async jwt({ token, user }) {
            if (user) {
                token.role = user.role;
                token.id = user.id;
            } else if (token.email) {
                const { data: dbUser } = await supabaseAdmin
                    .from('users')
                    .select('*')
                    .eq('email', token.email)
                    .single();

                if (dbUser) {
                    token.role = dbUser.role;
                    token.id = dbUser.id;
                    token.status = dbUser.status;
                }
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                (session.user as any).role = token.role;
                (session.user as any).id = token.id;
                (session.user as any).status = token.status;
            }
            return session;
        }
    },
    pages: {
        signIn: '/login',
    },
    session: {
        strategy: 'jwt'
    }
};
