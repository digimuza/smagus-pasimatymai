CREATE INDEX "qe_question_id_idx" ON "question_events" USING btree ("question_id");--> statement-breakpoint
CREATE INDEX "qe_event_type_idx" ON "question_events" USING btree ("event_type");--> statement-breakpoint
CREATE INDEX "qe_session_id_idx" ON "question_events" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX "qe_question_event_idx" ON "question_events" USING btree ("question_id","event_type");