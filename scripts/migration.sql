-- Run these commands in your Postgres database before starting the server

CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE IF NOT EXISTS researcher_profiles (
    user_id UUID PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    institution TEXT,
    domains TEXT[] DEFAULT '{}',
    bio TEXT,
    created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS hypothesis_embeddings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    plan_id UUID NOT NULL,
    hypothesis TEXT NOT NULL,
    embedding vector(384),
    created_at TIMESTAMP DEFAULT now()
);

-- Index for similarity search
CREATE INDEX ON hypothesis_embeddings USING ivfflat (embedding vector_cosine_ops)
    WITH (lists = 100);

CREATE TABLE IF NOT EXISTS collaboration_requests (
    request_id UUID PRIMARY KEY,
    from_user_id UUID NOT NULL,
    to_user_id UUID NOT NULL,
    plan_id UUID NOT NULL,
    message TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS notifications (
    notification_id UUID PRIMARY KEY,
    user_id UUID NOT NULL,
    type TEXT NOT NULL,
    payload JSONB NOT NULL,
    read BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT now()
);

CREATE INDEX ON notifications (user_id, read);

CREATE TABLE IF NOT EXISTS experiment_plans (
    plan_id UUID PRIMARY KEY,
    hypothesis TEXT NOT NULL,
    literature_result JSONB,
    protocol_steps JSONB,
    materials JSONB,
    budget JSONB,
    timeline JSONB,
    validation JSONB,
    created_at TIMESTAMP DEFAULT now(),
    feedback_incorporated BOOLEAN DEFAULT false
);

CREATE TABLE IF NOT EXISTS feedback_entries (
    feedback_id UUID PRIMARY KEY,
    plan_id UUID NOT NULL,
    section TEXT NOT NULL,
    original_content TEXT,
    correction TEXT NOT NULL,
    experiment_domain TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT now()
);
