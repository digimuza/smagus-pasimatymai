import { postgresAdapter } from "@payloadcms/db-postgres";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import path from "path";
import { buildConfig } from "payload";
import { fileURLToPath } from "url";
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
import { Subscriptions } from "./collections/Subscriptions";
import { Users } from "./collections/Users";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

export default buildConfig({
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
