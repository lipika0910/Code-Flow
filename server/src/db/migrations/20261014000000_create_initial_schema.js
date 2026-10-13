/**
 * CodeFlow Initial Database Schema Migration
 * Reproducible relational schema for SQLite (local) and PostgreSQL (production).
 */

export async function up(knex) {
  // 1. Users Table
  await knex.schema.createTable('users', (t) => {
    t.string('id').primary();
    t.string('username').notNullable().unique();
    t.string('email').notNullable().unique();
    t.string('password_hash').notNullable();
    t.string('role').defaultTo('student'); // 'student' | 'admin'
    t.integer('xp').defaultTo(0);
    t.integer('level').defaultTo(1);
    t.string('display_name');
    t.timestamps(true, true);
  });

  // 2. Topics Table
  await knex.schema.createTable('topics', (t) => {
    t.string('id').primary();
    t.string('slug').notNullable().unique();
    t.string('title').notNullable();
    t.text('description');
    t.string('category').defaultTo('interactive'); // 'interactive' | 'readonly'
    t.integer('order_index').defaultTo(0);
    t.string('icon').defaultTo('bi-journal-code');
  });

  // 3. Lessons Table
  await knex.schema.createTable('lessons', (t) => {
    t.string('id').primary();
    t.string('topic_id').references('id').inTable('topics').onDelete('CASCADE');
    t.string('slug').notNullable().unique();
    t.string('title').notNullable();
    t.integer('order_index').defaultTo(0);
    t.string('estimated_time').defaultTo('15 min');
    t.string('difficulty').defaultTo('Beginner');
    t.text('objectives'); // JSON string
    t.text('content_markdown').notNullable();
    t.text('runnable_code');
    t.text('expected_output');
    t.text('common_mistakes'); // JSON string
    t.boolean('is_interactive').defaultTo(true);
    t.timestamps(true, true);
  });

  // 4. Practice Questions Table
  await knex.schema.createTable('practice_questions', (t) => {
    t.string('id').primary();
    t.string('topic_id').references('id').inTable('topics').onDelete('SET NULL');
    t.string('difficulty').defaultTo('Medium');
    t.string('type').defaultTo('mcq');
    t.string('title').notNullable();
    t.text('prompt').notNullable();
    t.text('code');
    t.text('options'); // JSON string
    t.text('answer').notNullable();
    t.text('hints'); // JSON string
    t.text('explanation');
  });

  // 5. Assessments Table
  await knex.schema.createTable('assessments', (t) => {
    t.string('id').primary();
    t.string('title').notNullable();
    t.string('topic').notNullable();
    t.string('difficulty').defaultTo('Intermediate');
    t.integer('time_limit_seconds').defaultTo(1800);
    t.integer('passing_score').defaultTo(70);
    t.timestamps(true, true);
  });

  // 6. Assessment Questions Table
  await knex.schema.createTable('assessment_questions', (t) => {
    t.string('id').primary();
    t.string('assessment_id').references('id').inTable('assessments').onDelete('CASCADE');
    t.integer('order_index').defaultTo(0);
    t.string('type').notNullable();
    t.integer('points').defaultTo(10);
    t.string('title').notNullable();
    t.text('prompt').notNullable();
    t.text('code');
    t.text('options'); // JSON string
    t.text('starter_code');
    t.text('server_answer');
    t.text('explanation');
  });

  // 7. Test Cases Table (with is_hidden flag)
  await knex.schema.createTable('test_cases', (t) => {
    t.string('id').primary();
    t.string('assessment_question_id').references('id').inTable('assessment_questions').onDelete('CASCADE');
    t.text('input').notNullable();
    t.text('expected_output').notNullable();
    t.boolean('is_hidden').defaultTo(false);
  });

  // 8. Assessment Attempts Table
  await knex.schema.createTable('assessment_attempts', (t) => {
    t.string('id').primary();
    t.string('user_id').references('id').inTable('users').onDelete('CASCADE');
    t.string('assessment_id').references('id').inTable('assessments').onDelete('CASCADE');
    t.integer('score').defaultTo(0);
    t.integer('total_points').defaultTo(100);
    t.integer('percentage').defaultTo(0);
    t.boolean('passed').defaultTo(false);
    t.timestamp('started_at');
    t.timestamp('submitted_at').defaultTo(knex.fn.now());
    t.text('feedback_json');
  });

  // 9. Lesson Progress Table (Unique constraint prevents duplicate complete awards)
  await knex.schema.createTable('lesson_progress', (t) => {
    t.increments('id').primary();
    t.string('user_id').references('id').inTable('users').onDelete('CASCADE');
    t.string('lesson_id').references('id').inTable('lessons').onDelete('CASCADE');
    t.timestamp('completed_at').defaultTo(knex.fn.now());
    t.unique(['user_id', 'lesson_id']);
  });

  // 10. Quiz Attempts Table
  await knex.schema.createTable('quiz_attempts', (t) => {
    t.increments('id').primary();
    t.string('user_id').references('id').inTable('users').onDelete('CASCADE');
    t.string('question_id').references('id').inTable('practice_questions').onDelete('CASCADE');
    t.boolean('correct').defaultTo(false);
    t.integer('hints_used').defaultTo(0);
    t.timestamp('attempted_at').defaultTo(knex.fn.now());
  });

  // 11. Projects Table
  await knex.schema.createTable('projects', (t) => {
    t.string('id').primary();
    t.string('user_id').references('id').inTable('users').onDelete('CASCADE');
    t.string('name').notNullable();
    t.text('description');
    t.text('html_code');
    t.text('css_code');
    t.text('js_code');
    t.string('runtime_mode').defaultTo('web');
    t.timestamps(true, true);
  });

  // 12. Project Versions Table
  await knex.schema.createTable('project_versions', (t) => {
    t.string('id').primary();
    t.string('project_id').references('id').inTable('projects').onDelete('CASCADE');
    t.integer('version_number').notNullable();
    t.string('name');
    t.text('html_code');
    t.text('css_code');
    t.text('js_code');
    t.timestamp('saved_at').defaultTo(knex.fn.now());
  });

  // 13. Snippets Table
  await knex.schema.createTable('snippets', (t) => {
    t.string('id').primary();
    t.string('user_id').references('id').inTable('users').onDelete('CASCADE');
    t.string('name').notNullable();
    t.text('code').notNullable();
    t.string('language').defaultTo('javascript');
    t.timestamp('created_at').defaultTo(knex.fn.now());
  });

  // 14. XP Events Table (Unique constraint enforces anti-farming idempotency)
  await knex.schema.createTable('xp_events', (t) => {
    t.increments('id').primary();
    t.string('user_id').references('id').inTable('users').onDelete('CASCADE');
    t.string('reward_key').notNullable();
    t.integer('xp_amount').notNullable();
    t.timestamp('created_at').defaultTo(knex.fn.now());
    t.unique(['user_id', 'reward_key']);
  });
}

export async function down(knex) {
  await knex.schema.dropTableIfExists('xp_events');
  await knex.schema.dropTableIfExists('snippets');
  await knex.schema.dropTableIfExists('project_versions');
  await knex.schema.dropTableIfExists('projects');
  await knex.schema.dropTableIfExists('quiz_attempts');
  await knex.schema.dropTableIfExists('lesson_progress');
  await knex.schema.dropTableIfExists('assessment_attempts');
  await knex.schema.dropTableIfExists('test_cases');
  await knex.schema.dropTableIfExists('assessment_questions');
  await knex.schema.dropTableIfExists('assessments');
  await knex.schema.dropTableIfExists('practice_questions');
  await knex.schema.dropTableIfExists('lessons');
  await knex.schema.dropTableIfExists('topics');
  await knex.schema.dropTableIfExists('users');
}
