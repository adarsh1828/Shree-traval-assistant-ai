import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route to handle the trip planning request
  app.post("/api/plan-trip", async (req, res) => {
    try {
      const { origin, destination, budget, days, nights, interests, tripFocus, transportMode, mealPreference, roomType } = req.body;

      if (!origin || !destination || !budget || !days || !nights || !interests) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: "GEMINI_API_KEY is missing." });
      }

      const ai = new GoogleGenAI({ apiKey });

      const prompt = `You are 'Shree', an advanced and expert AI Trip Planner. Your goal is to create a highly detailed, localized, and budget-friendly travel itinerary based on the user's inputs. 

CRITICAL RULE: DO NOT use long paragraphs anywhere in your response. Keep explanations very brief, simple, and easy to understand. Use short bullet points for all text outside of the table.

User Inputs:
- Origin: ${origin}
- Destination: ${destination}
- Total Budget: ${budget}
- Duration: ${days} Days, ${nights} Nights
- Theme & Focus: ${tripFocus || "Any"}
- Interests: ${interests}
- Preferred Transport Mode: ${transportMode || "Any (Best Recommended)"}
- Dietary Preference: ${mealPreference || "Any"}
- Accommodation Preference: ${roomType || "Any"}

You must strictly follow these guidelines to generate the travel report:

1. ACCURATE REAL-WORLD DATA:
- Ensure all transportation options (train names/numbers, bus routes), distances, travel times, entry fees, and accommodation costs reflect realistic, current real-world pricing and logistics in India based on your knowledge.
- Do not hallucinate fictitious train names, phantom places, or fake prices. Use real examples (e.g. "Shatabdi Express (12002)", real average homestay costs).

2. UNDERSTAND THE BUDGET:
The total budget provided by the user is their absolute limit. You must calculate and distribute this budget smartly across Transportation (Train/Bus/Car), Accommodation (Stay), Meals, and Sightseeing/Activities. Ensure the total cost does not exceed the user's budget.

3. TRIP ROADMAP (VISUAL TIMELINE):
- Before detailing the logistics, provide a clear, one-line visual roadmap of the journey using arrows (e.g., Origin ➔ Transit ➔ Destination).

4. THEME & SPECIAL FEATURES HIGHLIGHTS (BULLET POINTS):
- Provide specific, personalized information catering to the user's Theme Focus ("${tripFocus}") and Interests ("${interests}").
- IMPORTANT: If the focus is "History & Heritage", or if there are any historical places, you MUST explain the historical importance, background, and special features of those places. Also include precise ticket/entry fees for these historical sites.
- Detail the key spots and experiences, providing specific info on what features the user will see, their true importance, and accurate cost estimates for tickets/activities.

5. DETAILED LOGISTICS & TRANSPORTATION (BULLET POINTS):
- Provide a detailed breakdown of the journey from Origin to Destination based on ("${transportMode || "Any"}").
- Include SPECIFIC train/bus names and numbers, precise departure/arrival times, exact boarding/dropping points, and realistic ticket prices per person.
- If "Private Car" or "Rented Car", give a detailed route description (highways to take), estimated driving time, toll costs, and fuel costs.

6. DETAILED ACCOMMODATION & MEALS (BULLET POINTS):
- Strongly recommend specific local "Homestays". Ensure the accommodation matches the user's Accommodation Preference ("${roomType || "Any"}"). Detail the exact features (e.g., AC/Non-AC, home-cooked food, host interaction, location advantages) and accurate cost/night.
- Detail specific local cuisines and places to eat based on the user's Dietary Preference ("${mealPreference || "Any"}"). Name specific options for "Nasta" (breakfast), Lunch, and Dinner with detailed price estimates.

7. DAY-WISE ITINERARY (TABLE FORMAT):
You must present the entire itinerary in a clean, structured Markdown TABLE format. The table should have the following columns:
| Day | Activity / Sightseeing (Focusing on interests) | Stay/Homestay (Detailed Features & Cost/Night) | Meal Plan (Detailed Nasta, Lunch, Dinner & Cost) | Estimated Cost (INR) |

8. BUDGET BREAKDOWN SUMMARY (VERY SHORT):
After the table, provide a bulleted expense breakdown:
- Transport (To & Fro): ₹X
- Stay: ₹X
- Food & Drinks: ₹X
- Theme Experiences & Sightseeing (${tripFocus} / ${interests}): ₹X (Including specific entry fees/tickets for historical places/parks/activities)
- **Total Estimated Cost:** ₹X (Must be within user's budget)

9. SMART PACKING LIST:
- Generate a personalized, smart packing list at the very end of the report.
- Tailor the items specifically to the user's Theme Focus ("${tripFocus}"), destination ("${destination}", considering its typical weather and terrain), and Duration.
- Create 10-15 specific, practical items.
- Format this EXACTLY as a Markdown task list using \`[ ]\` syntax. For example:
- [ ] Comfortable walking shoes for heritage tours
- [ ] Light jacket for evening breeze
- [ ] Power bank for long day trips

Tone: Professional, highly accurate, simple words, strictly no paragraphs. Greet the user simply as "Welcome! I am Shree, your Trip Planner".`;

      let response;
      let retries = 5;
      let delay = 2000;
      let currentModel = "gemini-3.5-flash";
      
      while (retries > 0) {
        try {
          response = await ai.models.generateContent({
            model: currentModel,
            contents: prompt,
          });
          break;
        } catch (error: any) {
          const isBusy = error?.status === 503 || error?.message?.includes("503") || error?.message?.includes("high demand");
          const isQuota = error?.status === 429 || error?.message?.includes("429") || error?.message?.includes("quota");
          
          if (isQuota && currentModel === "gemini-3.5-flash" && retries <= 3) {
            console.warn(`Quota reached for gemini-3.5-flash, falling back to gemini-3.1-flash-lite...`);
            currentModel = "gemini-3.1-flash-lite";
          } else if (isQuota && currentModel === "gemini-3.1-flash-lite" && retries <= 2) {
            console.warn(`Quota reached for gemini-3.1-flash-lite, falling back to gemini-3.1-pro-preview...`);
            currentModel = "gemini-3.1-pro-preview";
          }

          if ((isBusy || isQuota) && retries > 1) {
            console.warn(`Model busy or quota reached, retrying in ${delay}ms... (${retries - 1} left)`);
            await new Promise((resolve) => setTimeout(resolve, delay));
            retries--;
            delay *= 1.5;
          } else if (isBusy) {
            throw new Error("The AI model is currently experiencing high demand. Please try again in a moment.");
          } else if (isQuota) {
            throw new Error("The free tier limit for the AI has been reached. Please try again in about a minute.");
          } else {
            throw error;
          }
        }
      }

      const text = response?.text || "";

      res.json({ itinerary: text });
    } catch (error: any) {
      console.error("Error generating trip plan:", error);
      res.status(500).json({ error: error?.message || "Failed to generate trip plan." });
    }
  });

  // Vite middleware setup
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
