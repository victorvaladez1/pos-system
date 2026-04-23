import { Request, Response } from "express";
import { User, isUserRole } from "../types/users.types.js";
import { validate as isUuid } from "uuid";
import {
    createUserRow,
    getUserRows,
    updateUserRowById,
    deleteUserRowById
} from "../services/users.service.js";

export const createUser = async (req: Request, res: Response) => {
    const { first_name, middle_name, last_name, user_role, passcode_hash, is_active } = req.body ?? {};

    if (!first_name || typeof first_name !== "string" || first_name.trim() == "") {
        return res.status(400).json({ error: "Enter valid first_name." });
    }

    if (middle_name === undefined || (middle_name !== null && (typeof middle_name !== "string" || middle_name.trim() === ""))) {
        return res.status(400).json({ error: "Enter valid middle_name." });
    }

    if (!last_name || typeof last_name !== "string" || last_name.trim() == "" ) {
        return res.status(400).json({ error: "Enter valid last_name." });
    }

    if (!isUserRole(user_role)) {
        return res.status(400).json({ error: "Enter valid user_role." });
    }

    if (!passcode_hash || typeof passcode_hash !== "string" || passcode_hash.trim() == "") {
        return res.status(400).json({ error: "Enter valid passcode_hash." });
    }

    if (is_active === undefined || typeof is_active !== "boolean") {
        return res.status(400).json({ error: "Enter valid is_active."});
    }

    const newUser: User = {
        first_name: first_name.trim(),
        middle_name: middle_name === null ? null : middle_name.trim(),
        last_name: last_name.trim(),
        user_role,
        passcode_hash: passcode_hash.trim(),
        is_active
    };
    
    try {
        const user = await createUserRow(newUser);
        return res.status(201).json({ user });
    } catch (error) {
        console.log("Failed to create user row in db.", error);
        return res.status(500).json({ error: "Failed to create user row in db."});
    }
};

export const getUsers = async (req: Request, res: Response) => {
    try {
        const users = await getUserRows();
        return res.status(200).json({ users });
    } catch (error) {
        console.log("Failed to retrieve user rows from db.", error);
        return res.status(500).json({ error: "Failed to retrieve user rows from db."});
    }
};

export const updateUser = async (req: Request, res: Response) => {
    const { first_name, middle_name, last_name, user_role, passcode_hash, is_active } = req.body ?? {};
    const { id } = req.params ?? {};

    if (!id || !isUuid(id) || Array.isArray(id)) {
        return res.status(400).json({ error: "Enter valid id."});
    }

    if (!first_name || typeof first_name !== "string" || first_name.trim() == "") {
        return res.status(400).json({ error: "Enter valid first_name."});
    }

    if (middle_name === undefined || (middle_name !== null && (typeof middle_name !== "string" || middle_name.trim() === ""))) {
        return res.status(400).json({ error: "Enter valid middle_name."});
    }

    if (!last_name || typeof last_name !== "string" || last_name.trim() == "") {
        return res.status(400).json({ error: "Enter valid last_name." });
    }

    if (!isUserRole(user_role)) {
        return res.status(400).json({ error: "Enter valid user_role." });
    }

    if (!passcode_hash || typeof passcode_hash !== "string" || passcode_hash.trim() == "") {
        return res.status(400).json({ error: "Enter valid passcode_hash."});
    }

    if (is_active === undefined || typeof is_active !== "boolean") {
        return res.status(400).json({ error: "Enter valid is_active." });
    }
    
    const user: User = {
        first_name: first_name.trim(),
        middle_name: middle_name === null ? null : middle_name.trim(),
        last_name: last_name.trim(),
        user_role,
        passcode_hash: passcode_hash.trim(),
        is_active
    };

    try {
        const updatedUser = await updateUserRowById(id, user);
        return res.status(200).json({ updatedUser });
    } catch (error) {
        console.log("Failed to update user row in db.", error);
        return res.status(500).json({ error: "Failed to update user row in db."});
    }
};

export const deleteUser = async (req: Request, res: Response) => {
    const { id } = req.params ?? {};

    if (!id || !isUuid(id) || Array.isArray(id)) {
        return res.status(400).json({ error: "Enter valid id"});
    }
    
    try {
        const deletedUser = await deleteUserRowById(id);
        return res.status(200).json({ deletedUser });
    } catch (error) {
        console.log("Failed to delete user row from db.", error);
        return res.status(500).json({ error: "Failed to delete user row from db."});
    }
};