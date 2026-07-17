import sql from "../db.js";

const clearDatabase = async () => {
    await sql`DELETE FROM order_item_modifiers`;
    await sql`DELETE FROM payments`;
    await sql`DELETE FROM order_items`;
    await sql`DELETE FROM orders`;
    await sql`DELETE FROM users`;
    await sql`DELETE FROM items`;
    await sql`DELETE FROM modifiers`;
    await sql`DELETE FROM categories`;
    await sql`DELETE FROM tables`;
};

const requireSeedRecord = <T>(record: T | undefined, name: string): T => {
    if (!record) {
        throw new Error(`Missing seed record: ${name}`);
    }

    return record;
};

const seedUsers = async () => {
    const users = await sql`
        INSERT INTO users (
            first_name,
            middle_name,
            last_name,
            user_role,
            passcode_hash,
            is_active
        )
        VALUES
            (${"Alex"}, ${null}, ${"Rivera"}, ${"admin"}::user_role_enum, ${"1234"}, ${true}),
            (${"Jordan"}, ${null}, ${"Lee"}, ${"manager"}::user_role_enum, ${"2345"}, ${true}),
            (${"Taylor"}, ${null}, ${"Morgan"}, ${"cashier"}::user_role_enum, ${"3456"}, ${true}),
            (${"Casey"}, ${null}, ${"Patel"}, ${"server"}::user_role_enum, ${"4567"}, ${true}),
            (${"Riley"}, ${null}, ${"Chen"}, ${"kitchen"}::user_role_enum, ${"5678"}, ${true}),
            (${"Sam"}, ${null}, ${"Brooks"}, ${"host"}::user_role_enum, ${"6789"}, ${true})
        RETURNING *
    `;

    return users;
};

const seedCategories = async () => {
    const categories = await sql`
        INSERT INTO categories (name)
        VALUES
            (${"Appetizers"}),
            (${"Entrees"}),
            (${"Sides"}),
            (${"Drinks"}),
            (${"Desserts"})
        RETURNING *
    `;

    return categories;
};

const seedTables = async () => {
    const tables = await sql`
        INSERT INTO tables (table_number, capacity, current_status)
        VALUES
            (${1}, ${2}, ${"available"}::table_status_enum),
            (${2}, ${4}, ${"available"}::table_status_enum),
            (${3}, ${4}, ${"occupied"}::table_status_enum),
            (${4}, ${6}, ${"reserved"}::table_status_enum),
            (${5}, ${2}, ${"dirty"}::table_status_enum),
            (${6}, ${8}, ${"available"}::table_status_enum)
        RETURNING *
    `;

    return tables;
};

const seedItems = async (categories: any[]) => {
    const appetizers = categories.find((category) => category.name === "Appetizers");
    const entrees = categories.find((category) => category.name === "Entrees");
    const sides = categories.find((category) => category.name === "Sides");
    const drinks = categories.find((category) => category.name === "Drinks");
    const desserts = categories.find((category) => category.name === "Desserts");

    const items = await sql`
        INSERT INTO items (
            name,
            description,
            price_in_cents,
            category_id,
            is_active
        )
        VALUES
            (${"Chips and Salsa"}, ${"House chips with fresh salsa."}, ${499}, ${appetizers.id}, ${true}),
            (${"Loaded Nachos"}, ${"Tortilla chips with cheese, beans, and toppings."}, ${899}, ${appetizers.id}, ${true}),

            (${"Classic Burger"}, ${"Beef patty with lettuce, tomato, and house sauce."}, ${1199}, ${entrees.id}, ${true}),
            (${"Chicken Tacos"}, ${"Three tacos with grilled chicken and salsa."}, ${1099}, ${entrees.id}, ${true}),
            (${"Veggie Bowl"}, ${"Rice bowl with vegetables, beans, and avocado."}, ${999}, ${entrees.id}, ${true}),

            (${"French Fries"}, ${"Crispy salted fries."}, ${399}, ${sides.id}, ${true}),
            (${"Side Salad"}, ${"Mixed greens with house dressing."}, ${449}, ${sides.id}, ${true}),

            (${"Iced Tea"}, ${"Fresh brewed iced tea."}, ${299}, ${drinks.id}, ${true}),
            (${"Lemonade"}, ${"House lemonade."}, ${349}, ${drinks.id}, ${true}),
            (${"Sparkling Water"}, ${"Bottled sparkling water."}, ${249}, ${drinks.id}, ${true}),

            (${"Chocolate Brownie"}, ${"Warm brownie with chocolate drizzle."}, ${599}, ${desserts.id}, ${true}),
            (${"Vanilla Ice Cream"}, ${"Two scoops of vanilla ice cream."}, ${499}, ${desserts.id}, ${true})
        RETURNING *
    `;

    return items;
};

const seedModifiers = async () => {
    const modifiers = await sql`
        INSERT INTO modifiers (name, price_in_cents)
        VALUES
            (${"Extra Cheese"}, ${150}),
            (${"Avocado"}, ${200}),
            (${"Bacon"}, ${250}),
            (${"Extra Sauce"}, ${75}),
            (${"No Onions"}, ${0}),
            (${"Gluten-Free Bun"}, ${200})
        RETURNING *
    `;

    return modifiers;
};

const seedSampleOrders = async (users: any[], tables: any[], items: any[], modifiers: any[]) => {
    const server = users.find((user) => user.user_role === "server");
    const tableThree = tables.find((table) => table.table_number === 3);

    const burger = items.find((item) => item.name === "Classic Burger");
    const fries = items.find((item) => item.name === "French Fries");
    const icedTea = items.find((item) => item.name === "Iced Tea");
    const tacos = items.find((item) => item.name === "Chicken Tacos");

    const bacon = modifiers.find((modifier) => modifier.name === "Bacon");
    const extraSauce = modifiers.find((modifier) => modifier.name === "Extra Sauce");

    const orders = await sql`
        INSERT INTO orders (
            table_id,
            server_id,
            order_type,
            order_status,
            ticket_name,
            guest_count
        )
        VALUES
            (${tableThree.id}, ${server.id}, ${"dine_in"}::order_type_enum, ${"open"}::order_status_enum, ${"Table 3"}, ${2}),
            (${null}, ${server.id}, ${"takeout"}::order_type_enum, ${"open"}::order_status_enum, ${"Takeout Sample"}, ${1})
        RETURNING *
    `;

    const dineInOrder = requireSeedRecord(
        orders.find((order) => order.ticket_name === "Table 3"),
        "dine-in order"
    );

    const takeoutOrder = requireSeedRecord(
        orders.find((order) => order.ticket_name === "Takeout Sample"),
        "takeout order"
    );

    const orderItems = await sql`
        INSERT INTO order_items (
            order_id,
            item_id,
            quantity,
            unit_price_in_cents,
            notes,
            order_item_status
        )
        VALUES
            (${dineInOrder.id}, ${burger.id}, ${1}, ${burger.price_in_cents}, ${"Medium well."}, ${"submitted"}::order_item_status_enum),
            (${dineInOrder.id}, ${fries.id}, ${2}, ${fries.price_in_cents}, ${null}, ${"submitted"}::order_item_status_enum),
            (${dineInOrder.id}, ${icedTea.id}, ${2}, ${icedTea.price_in_cents}, ${null}, ${"ready"}::order_item_status_enum),
            (${takeoutOrder.id}, ${tacos.id}, ${1}, ${tacos.price_in_cents}, ${"Extra salsa on the side."}, ${"pending"}::order_item_status_enum)
        RETURNING *
    `;

    const burgerOrderItem = requireSeedRecord(
        orderItems.find((orderItem) => orderItem.item_id === burger.id),
        "burger order item"
    );

    await sql`
        INSERT INTO order_item_modifiers (
            order_item_id,
            modifier_id,
            quantity
        )
        VALUES
            (${burgerOrderItem.id}, ${bacon.id}, ${1}),
            (${burgerOrderItem.id}, ${extraSauce.id}, ${1})
    `;

    await sql`
        INSERT INTO payments (
            order_id,
            amount_in_cents,
            payment_method,
            payment_status
        )
        VALUES
            (${dineInOrder.id}, ${1000}, ${"card"}::payment_method_enum, ${"completed"}::payment_status_enum),
            (${takeoutOrder.id}, ${500}, ${"cash"}::payment_method_enum, ${"pending"}::payment_status_enum)
    `;

    return orders;
};

const seed = async () => {
    try {
        console.log("Clearing database...");
        await clearDatabase();

        console.log("Seeding users...");
        const users = await seedUsers();

        console.log("Seeding categories...");
        const categories = await seedCategories();

        console.log("Seeding tables...");
        const tables = await seedTables();

        console.log("Seeding items...");
        const items = await seedItems(categories);

        console.log("Seeding modifiers...");
        const modifiers = await seedModifiers();

        console.log("Seeding sample orders...");
        await seedSampleOrders(users, tables, items, modifiers);

        console.log("Seed completed successfully.");
    } catch (error) {
        console.error("Seed failed.", error);
        process.exitCode = 1;
    } finally {
        await sql.end();
    }
};

seed();