
  CREATE TABLE users
(
  id serial NOT NULL,
  display_name character varying(50) NOT NULL,
  email character varying(250) NOT NULL,
  hash text NOT NULL,
  salt text NOT NULL,
  created_date timestamp with time zone DEFAULT now(),
  deleted_date timestamp with time zone,
  type smallint NOT NULL,
  CONSTRAINT pk_users PRIMARY KEY (id)
)
WITH (
  OIDS=FALSE
);

CREATE UNIQUE INDEX ux_users_email
  ON users
  USING btree
  (email COLLATE pg_catalog."default");
  
CREATE TABLE posts
(
  id serial NOT NULL,
  user_id integer NOT NULL,
  post_type smallint NOT NULL,
  title character varying(100) NOT NULL,
  body text NOT NULL,
  tags character varying(25)[],
  published_date timestamp with time zone,
  edited_date timestamp with time zone,
  deleted_date timestamp with time zone,
  CONSTRAINT pk_posts PRIMARY KEY (id),
  CONSTRAINT fk_posts_users FOREIGN KEY (user_id)
      REFERENCES users (id) MATCH SIMPLE
      ON UPDATE NO ACTION ON DELETE NO ACTION
)
WITH (
  OIDS=FALSE
);

CREATE TABLE sessions
(
  token character(44) NOT NULL,
  user_id integer NOT NULL,
  created_date timestamp with time zone NOT NULL DEFAULT now(),
  expire_date timestamp with time zone NOT NULL,
  CONSTRAINT pk_sessions PRIMARY KEY (token),
  CONSTRAINT fk_sessions_users FOREIGN KEY (user_id)
      REFERENCES users (id) MATCH SIMPLE
      ON UPDATE NO ACTION ON DELETE NO ACTION
)
WITH (
  OIDS=FALSE
);

CREATE TABLE settings
(
  name character varying(40) NOT NULL,
  val text,
  CONSTRAINT pk_settings PRIMARY KEY (name)
)
WITH (
  OIDS=FALSE
);

CREATE UNIQUE INDEX ux_settings_name
  ON settings
  USING btree
  (name COLLATE pg_catalog."default");

  