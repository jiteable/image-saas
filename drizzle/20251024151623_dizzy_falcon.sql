CREATE TABLE "actionToken" (
	"id" serial PRIMARY KEY NOT NULL,
	"account" text NOT NULL,
	"code" text NOT NULL,
	"expired_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "apiKeys" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"key" varchar(100) NOT NULL,
	"appId" varchar(100) NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "apps" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" varchar(500),
	"deleted_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"user_id" text NOT NULL,
	"storage_id" integer,
	CONSTRAINT "apps_id_name_unique" UNIQUE("id","name")
);
--> statement-breakpoint
CREATE TABLE "storageConfiguration" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"user_id" uuid NOT NULL,
	"configuration" json NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"deleted_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "files" ADD COLUMN "app_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "password" text;