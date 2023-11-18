import type { NextApiRequest, NextApiResponse } from "next";
import { env } from "~/env.mjs";
import {
  CUISINE_TYPE,
  type EdamamAPI_Type,
  type Hit,
  MEAL_TYPE,
  type CuisineType,
  type MealType,
} from "~/pages/types/edamam";

export type RecipeResponse = {
  list?: Hit[];
  error?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<RecipeResponse>,
) {
  try {
    const { cuisineType, mealType } = req.query;

    if (
      typeof cuisineType !== "string" ||
      !CUISINE_TYPE.includes(cuisineType as CuisineType) ||
      typeof mealType !== "string" ||
      !MEAL_TYPE.includes(mealType as MealType)
    ) {
      res.status(400).json({ error: "Oops bad request" });
      return;
    }

    const params = new URLSearchParams({
      app_id: env.EDAMAM_APP_ID,
      app_key: env.EDAMAM_APP_KEY,
      cuisineType,
      mealType,
      random: "true",
      type: "any",
    });

    const response = await fetch(
      `https://api.edamam.com/api/recipes/v2?${params.toString()}`,
    );

    const resp = (await response.json()) as EdamamAPI_Type;

    res.status(200).json({ list: resp.hits });
  } catch (err) {
    res.status(500).json({ error: "Oops something went wrong" });
  }
}
