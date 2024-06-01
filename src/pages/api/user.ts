import type {NextApiRequest, NextApiResponse} from "next";
import axios from "axios";
import {createUpSertQuery, getClient, GetUserID} from "@/lib/db";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse,
) {


    // Get the user ID
    const userid = await GetUserID(req, res);
    console.log(userid)

    // Connect to the DB
    const client = await getClient();
    let query = ""

    console.log("GOT CLIENT");

    // Get the operation from the request
    const operation = req.method;
    switch (operation) {
        case "GET":

            // Fetch the data
            query = `SELECT * FROM users WHERE uid = '${userid}'`;
            break;

        case "POST":

            // Get the data
            const {
                level,
                exp,
                rexp,
                totalPlays,
                totalKills,
                spentCash,
                kills,
            } = req.body;

            // Update the data
            query = createUpSertQuery("users",
                ["uid", "updatedAt", "level", "exp", "rexp", "totalPlays", "totalKills", "spentCash", "kills"],
                [userid, new Date().toISOString().slice(0, 19).replace('T', ' '), level, exp, rexp, totalPlays, totalKills, spentCash, JSON.stringify(kills)]
                )

            break;

    }

    // Make the operation
    console.log("MAKING QUERY");
    console.log(query);
    const data  = await client.getall(query);
    console.log("QUERY DONE");

    // Handle the response
    switch (operation) {
        case "GET":
            // Check if the data exists
            if (data.length === 0) {
                res.status(404).json({message: "Not found"});
                return;
            }
            res.status(200).json(data);
            break;

        case "POST":
            res.status(201).json(data);
            break;
    }
}
