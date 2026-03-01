import path from "node:path";
import { fileURLToPath } from "node:url";
import { postgresAdapter } from "@payloadcms/db-postgres";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { buildConfig } from "payload";
import { Audiences } from "./collections/Audiences";
import { Categories } from "./collections/Categories";
import { DailyQuestions } from "./collections/DailyQuestions";
import { GameSessions } from "./collections/GameSessions";
import { PlayerProgress } from "./collections/PlayerProgress";
import { Players } from "./collections/Players";
import { QuestionEvents } from "./collections/QuestionEvents";
import { QuestionSubmissions } from "./collections/QuestionSubmissions";
import { Questions } from "./collections/Questions";
import { SpicyCards } from "./collections/SpicyCards";
import { SpicyCardTypes } from "./collections/SpicyCardTypes";
import { StripeEvents } from "./collections/StripeEvents";
import { Subscriptions } from "./collections/Subscriptions";
import { Users } from "./collections/Users";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

export default buildConfig({
	serverURL: process.env.NEXT_PUBLIC_URL || "http://localhost:7743",
	cors: [process.env.NEXT_PUBLIC_URL || "http://localhost:7743"],
	admin: {
		components: {
			afterDashboard: ["./components/admin/StatisticsDashboard"],
			beforeDashboard: ["./components/admin/DashboardStats"],
		},
		importMap: {
			baseDir: path.resolve(dirname),
		},
	},
	collections: [
		Users,
		Players,
		PlayerProgress,
		Subscriptions,
		Categories,
		Questions,
		SpicyCardTypes,
		SpicyCards,
		StripeEvents,
		GameSessions,
		QuestionEvents,
		Audiences,
		DailyQuestions,
		QuestionSubmissions,
	],
	db: postgresAdapter({
		pool: {
			connectionString: process.env.DATABASE_URL || "",
		},
	}),
	editor: lexicalEditor(),
	secret: process.env.PAYLOAD_SECRET || "",
	typescript: {
		outputFile: path.resolve(dirname, "payload-types.ts"),
	},
});
