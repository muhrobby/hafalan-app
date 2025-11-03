import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';

export default function createdUser() {
    return (
        <AppLayout>
            <Head title="Create Student" />
            <div>Created Student</div>
        </AppLayout>
    );
}
