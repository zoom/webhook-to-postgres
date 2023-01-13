# Zoom Webhook to Postgress Sample App

The use of this sample app is subject to our [Terms of Use](https://zoom.us/docs/en-us/zoom_api_license_and_tou.html)

This is a sample app using a Webhook Only App to send events to a PostgreSQL Database.

## Prerequisites

1. Node JS
2. Ngrok
3. PostgreSQL 
4. Zoom Account
5. Webhook only app credentials
      - Account ID
      - Client ID
      - Client Secret

## Getting started

Open your terminal:

```bash
# Clone down this repository
git clone https://github.com/zoom/webhook-to-postgres

# Navigate into the cloned project directory
cd mywebhook-app 

# Run NPM to install the app dependencies
npm install

# initialize your ngrok session
ngrok http 3000
```

### Create your Webhook Only App

In your web browser, navigate to [Zoom Developer Portal](https://marketplace.zoom.us/) and register/log into your developer account.

Click the "Build App" button at the top and choose "Webhook Only" application, give it a name and click "Create"

<img width="700" alt="Screen Shot 2022-08-23 at 5 38 26 PM" src="https://user-images.githubusercontent.com/68508455/186273651-4284b8e6-cc65-43d4-b988-4e6642bf5b49.png">

Follow allong with Using Webhook documentation as we set this up:

[Using Webhooks](https://marketplace.zoom.us/docs/api-reference/webhook-reference)

### Config: Information

The following information is required to activate your application:

    - Basic Information
        1. App name
        2. Short description
        3. Company name
    - Developer Contact Information 
        1. Name 
        2. Email address


### Config: App Features
1. Name your particular event (Subscription name)
2. Add the event notification endpoint URL, followed by /webhook (In your terminal where you launched ngrok find the forwarding https value and copy/paste that here)
3. Click "+ Add Events" and from the Meeting tab, select "Meeting has been created" and "Meeting has been deleted" events and click Done
4. Lastly, navigate to the Activation tab and make sure your app is activaded

### Config .env

Open the .env file in your text editor and enter the following information from the Feature section you just configured.

```bash
# Zoom Secret token from your Webhook only app
ZOOM_WEBHOOK_SECRET_TOKEN=

# PostgreSQL credentials and information (you will come back and fill up this information after we set up our database)
PORT=
PG_USER=
PG_HOST=
PG_DATABASE=
PG_PASSWORD=
PG_PORT=

```

### Config: Creating Database

If you already  have postgress installed in your local environment you can skip these steps, if not follow along to install pg and create a table in your database. 

- If you are using Windows, download a [Windows installer of PostgreSQL](https://www.postgresql.org/download/windows/) or you can use this [PostgreSQL Portable Copy](https://github.com/garethflowers/postgresql-portable)
- If you are using a Mac and you have Homebrew installed on your computer, open up the terminal and install postgresql with brew:

```bash
brew install postgresql
```

After the installation is complete, we’ll want to get postgresql up and running, which we can do with services start

```bash 
brew services start postgresql
```

With PostgreSQL now installed, we will connect to the default postgres database running 

```bash
psql postgres
```

We are now inside psql in the postgres database, you will see the prompt ends with an # to denote that we are logged in as the superuser, or root (postgres=#)

Commands within psql start with a backlash \. To test this, we can check what database, user and por we have connected to using the \conninfo command

```bash
postgres=# \conninfo
```

#### Creating a role in Postgres

We are going to create a role called "me" and give it a password of "password":

```bash
postgres=# CREATE ROLE me WITH LOGIN PASSWORD 'password';
```

And we want "me" to be able to create a database:

```bash
postgres=# ALTER ROLE me CREATEDB;
```

Now, we will create a database for the "me" user. Exit from the default session with \q for quit and now we will connect postgres with "me"

```bash
psql -d postgres -U me
```

We can create a database with the SQL command as follows:

```bash
CREATE DATABASE zoomwebhooks;
```

Connect to the new database 

```bash
\c zoomwebhooks
```
You are now connected to database "zoomwebhooks" as a user "me".

#### Creating a table in Postgres

Finally, in the psql command prompt, we will create a table called events with four fields, two VARCHAR types, one BIGINT type and an auto-incrementing PRIMARY KEY ID:

```bash
CREATE TABLE events (
  ID SERIAL PRIMARY KEY,
  name VARCHAR(30),
  accountid VARCHAR(30),
  meetingid BIGINT
);
```

We have finished with all our PostgreSQL tasks and make sure to add the credentials in your .env file. 
Now it is time to get our app up and running!


## Start the App

### Using your app

Run the npm script to start your application.

```bash
npm run start
```

While your app is running on port 3000, go to the WebPortal [here](https://zoom.us) and create a meeting or delete an existing meeting in your account. Once you do this, you will see the event printed in your console and as well a new instance created in your Postgress database.

You can add as many events as you want and they all will be stored in your database.

Happy coding! 


## Need help?
If you're looking for help, try [Developer Support](https://devsupport.zoom.us) or our [Developer Forum](https://devforum.zoom.us). Priority support is also available with [Premier Developer Support](https://zoom.us/docs/en-us/developer-support-plans.html) plans.
