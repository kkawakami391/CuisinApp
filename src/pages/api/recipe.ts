import type { NextApiRequest, NextApiResponse } from "next";
import OpenAI from "openai";
// import { env } from "~/env.mjs";

const openai = new OpenAI({
  // apiKey: env.OPENAI_API_KEY,
});

export type RecipeResponse = {
  list?: string[];
  error?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<RecipeResponse>,
) {
  try {
    const ingredients = req.query.items;

    if (typeof ingredients !== "string" || ingredients.trim() === "") {
      res.status(400).json({ error: "Oops bad request" });
      return;
    }

    const response = await openai.chat.completions.create({
      messages: [
        {
          role: "user",
          content: `Make a list of possible recipes with this ingredients: ${ingredients}.  \n\n1.`,
        },
      ],
      model: "gpt-3.5-turbo",
    });

    const recipes = response.choices[0]?.message.content;

    if (recipes) {
      const list = parseRecipes(recipes);
      res.status(200).json({ list });
      return;
    }
    res.status(500).json({ error: "Oops bad recipes" });
  } catch (err) {
    res.status(500).json({ error: "Oops something went wrong" });
  }
}

function parseRecipes(text: string) {
  const lines = text.split("\n");

  lines.forEach((line, i) => {
    if (line && /^\d+\./.test(line)) {
      lines[i] = line.replace(/^\d+\./, "").trim();
    }
  });

  return lines;
}
