import type { User } from "firebase/auth";

export interface signUpForm {
  email: string;
  password: string;
  username: string;
}

export interface loginForm {
  email: string;
  password: string;
}

export interface forgotPassword {
    email: string;
}

export interface resetPassword {
    password: string;
}

export interface userProfile {
    userId: string;
    userMail: string;
    isEmailVerified: string;

    profile: {
        username: string;
        displayName: string;
        fullName: string;
        bio: string;
        imageUrl: string;
    }

    authProviders: {
        provider: string[];
        linkedData: Date;
    }

    settings: {
        preferences: {
            darkMode: boolean;
        }
    }

    relations: {
        blocked: string[];
    }

    timeStamps: {
        createdAt: Date;
        updatedAt: Date | null;
        lastSeen: Date | null;
    }

    security: {
        signUpIp: string;
        lastLoginIp: string | null;
        userDevice: string | null;
        version: string | null;
    };
}

export interface userStore {
    firebase: User | null;
    custom: userProfile | null;
    loading: boolean | null;
}