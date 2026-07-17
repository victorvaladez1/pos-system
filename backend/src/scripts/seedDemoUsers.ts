import sql from "../db.js";
import { hashPasscode } from "../utils/passcode.js";

type DemoUser = {
    first_name: string;
    last_name: string;
    user_role: "cashier" | "server" | "manager" | "admin" | "kitchen" | "host";
    passcode: string;
};

const demoUsers: DemoUser[] = [
    {
        first_name: "Admin",
        last_name: "User",
        user_role: "admin",
        passcode: "1111"
    },
    {
        first_name: "Manager",
        last_name: "User",
        user_role: "manager",
        passcode: "2222"
    },
    {
        first_name: "Cashier",
        last_name: "User",
        user_role: "cashier",
        passcode: "3333"
    },
    {
        first_name: "Kitchen",
        last_name: "User",
        user_role: "kitchen",
        passcode: "4444"
    },
    {
        first_name: "Server",
        last_name: "User",
        user_role: "server",
        passcode: "5555"
    },
    {
        first_name: "Host",
        last_name: "User",
        user_role: "host",
        passcode: "6666"
    }
];

const seedDemoUsers = async () => {
    try {
        console.log("Seeding demo users...");

        await sql`
            DELETE FROM users
            WHERE first_name IN (
                'Admin',
                'Manager',
                'Cashier',
                'Kitchen',
                'Server',
                'Host'
            )
            AND last_name = 'User'
        `;

        for (const user of demoUsers) {
            const hashedPasscode = await hashPasscode(user.passcode);

            await sql`
                INSERT INTO users (
                    first_name,
                    middle_name,
                    last_name,
                    user_role,
                    passcode_hash,
                    is_active
                )
                VALUES (
                    ${user.first_name},
                    ${null},
                    ${user.last_name},
                    ${user.user_role}::user_role_enum,
                    ${hashedPasscode},
                    ${true}
                )
            `;

            console.log(
                `${user.user_role.toUpperCase()} created - passcode: ${user.passcode}`
            );
        }

        console.log("Demo users seeded successfully.");
    } catch (error) {
        console.error("Failed to seed demo users.", error);
        process.exitCode = 1;
    } finally {
        await sql.end();
    }
};

seedDemoUsers();