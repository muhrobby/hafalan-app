-- CreateTable
CREATE TABLE "users" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "email_verified_at" DATETIME,
    "password" TEXT NOT NULL,
    "remember_token" TEXT,
    "two_factor_secret" TEXT,
    "two_factor_recovery_codes" TEXT,
    "two_factor_confirmed_at" DATETIME,
    "must_change_password" BOOLEAN NOT NULL DEFAULT false,
    "password_changed_at" DATETIME,
    "temporary_password_set_at" DATETIME,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "roles" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "guard_name" TEXT NOT NULL DEFAULT 'web',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "permissions" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "guard_name" TEXT NOT NULL DEFAULT 'web',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "model_has_roles" (
    "model_id" INTEGER NOT NULL,
    "role_id" INTEGER NOT NULL,
    "model_type" TEXT NOT NULL DEFAULT 'App\Models\User',

    PRIMARY KEY ("model_id", "role_id", "model_type"),
    CONSTRAINT "model_has_roles_model_id_fkey" FOREIGN KEY ("model_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "model_has_roles_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "role_has_permissions" (
    "permission_id" INTEGER NOT NULL,
    "role_id" INTEGER NOT NULL,

    PRIMARY KEY ("permission_id", "role_id"),
    CONSTRAINT "role_has_permissions_permission_id_fkey" FOREIGN KEY ("permission_id") REFERENCES "permissions" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "role_has_permissions_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "profiles" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "user_id" INTEGER NOT NULL,
    "nis" TEXT,
    "nip" TEXT,
    "phone" TEXT,
    "address" TEXT,
    "birth_date" DATETIME,
    "entry_year" INTEGER,
    "class_id" INTEGER,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "profiles_class_id_fkey" FOREIGN KEY ("class_id") REFERENCES "classes" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "classes" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "class_teacher" (
    "class_id" INTEGER NOT NULL,
    "teacher_id" INTEGER NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,

    PRIMARY KEY ("class_id", "teacher_id"),
    CONSTRAINT "class_teacher_class_id_fkey" FOREIGN KEY ("class_id") REFERENCES "classes" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "class_teacher_teacher_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "profiles" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "profile_relations" (
    "profile_id" INTEGER NOT NULL,
    "related_profile_id" INTEGER NOT NULL,
    "relation_type" TEXT NOT NULL DEFAULT 'guardian',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,

    PRIMARY KEY ("profile_id", "related_profile_id", "relation_type"),
    CONSTRAINT "profile_relations_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "profiles" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "profile_relations_related_profile_id_fkey" FOREIGN KEY ("related_profile_id") REFERENCES "profiles" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "surahs" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "number" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "arabic_name" TEXT NOT NULL,
    "verse_count" INTEGER NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "hafalans" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "student_id" INTEGER NOT NULL,
    "teacher_id" INTEGER,
    "surah_id" INTEGER NOT NULL,
    "from_ayah" INTEGER NOT NULL,
    "to_ayah" INTEGER NOT NULL,
    "date" DATETIME NOT NULL,
    "status" TEXT NOT NULL,
    "notes" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "hafalans_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "profiles" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "hafalans_teacher_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "profiles" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "hafalans_surah_id_fkey" FOREIGN KEY ("surah_id") REFERENCES "surahs" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "user_id" INTEGER,
    "action" TEXT NOT NULL,
    "model" TEXT,
    "model_id" INTEGER,
    "old_values" TEXT,
    "new_values" TEXT,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "audit_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "roles_name_key" ON "roles"("name");

-- CreateIndex
CREATE UNIQUE INDEX "permissions_name_key" ON "permissions"("name");

-- CreateIndex
CREATE INDEX "model_has_roles_model_type_model_id_idx" ON "model_has_roles"("model_type", "model_id");

-- CreateIndex
CREATE UNIQUE INDEX "profiles_user_id_key" ON "profiles"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "profiles_nis_key" ON "profiles"("nis");

-- CreateIndex
CREATE UNIQUE INDEX "profiles_nip_key" ON "profiles"("nip");

-- CreateIndex
CREATE INDEX "profiles_user_id_idx" ON "profiles"("user_id");

-- CreateIndex
CREATE INDEX "profiles_nis_idx" ON "profiles"("nis");

-- CreateIndex
CREATE INDEX "profiles_nip_idx" ON "profiles"("nip");

-- CreateIndex
CREATE INDEX "profiles_class_id_idx" ON "profiles"("class_id");

-- CreateIndex
CREATE INDEX "profiles_created_at_idx" ON "profiles"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "classes_name_key" ON "classes"("name");

-- CreateIndex
CREATE UNIQUE INDEX "surahs_number_key" ON "surahs"("number");

-- CreateIndex
CREATE INDEX "hafalans_student_id_idx" ON "hafalans"("student_id");

-- CreateIndex
CREATE INDEX "hafalans_teacher_id_idx" ON "hafalans"("teacher_id");

-- CreateIndex
CREATE INDEX "hafalans_surah_id_idx" ON "hafalans"("surah_id");

-- CreateIndex
CREATE INDEX "hafalans_date_idx" ON "hafalans"("date");

-- CreateIndex
CREATE INDEX "audit_logs_user_id_idx" ON "audit_logs"("user_id");

-- CreateIndex
CREATE INDEX "audit_logs_action_idx" ON "audit_logs"("action");

-- CreateIndex
CREATE INDEX "audit_logs_created_at_idx" ON "audit_logs"("created_at");
