// User Types
interface User {
    email: string;
    id: string;
}

type UserState = User | null;

// ----------------------------------------
// Profile Types
interface Profile {
    id: string;
    name?: string;
    bio?: string;
}

type ProfileState = Profile | null;

// ----------------------------------------
// Payment Types
interface LSPayment {
    id: string;
    lemonSqueezyId: number;
    orderId: string;
    name: string;
    email: string;
    status: string;
    renewsAt: Date | null;
    endsAt: Date | null;
    trialEndsAt: Date | null;
    resumesAt: Date | null;
    userId: string;
    isUsageBased: boolean;
    subscriptionItemId: number;
    customerId: number;
}

type LSPayments = Payment[] | null;

interface LSPaymentResponse {
    url: string;
}

interface LSCancelSubscriptionResponse {
    message: string;
}

// ----------------------------------------
// Contact Types

interface Contact {
    id: string;
    firstName: string;
    lastName: string;
    middleName?: string;
    suffix?: string;
    salutation?: string;
    workEmail?: string;
    personalEmail?: string;
    workPhone?: string;
    personalPhone?: string;
    workAddress?: string;
    personalAddress?: string;
    jobTitle?: string;
    backgroundInfo?: string;
    birthday?: Date;
    groups: {
        id: string;
        name: string;
    }[];
    historyEvents: {
        id: string;
        type: string;
        createdAt: string;
        updatedAt: string;
        userId: string;
        contactId: string;
        note?: string;
    }[];
    tasks: {
        id: string;
        contactId: string;
        name: string;
        description?: string;
        dueAt: string;
        status: "PENDING" | "DONE";
        createdAt: string;
        updatedAt: string;
    }[];
}

type ContactWithoutId = Omit<Contact, "id">;

type Contacts = Contact[] | null;

// ----------------------------------------
// Toast Types

interface Toast {
    id: number;
    title: string;
    message: string;
}

type Toasts = Toast[];
