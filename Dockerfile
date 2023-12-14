# syntax = docker/dockerfile:1

# Adjust NODE_VERSION as desired
ARG NODE_VERSION=16.14.2
FROM node:${NODE_VERSION}-slim as base

LABEL fly_launch_runtime="NodeJS"

# NodeJS app lives here
WORKDIR /src/pg-app

# Set production environment
ENV NODE_ENV=production
ARG YARN_VERSION=1.22.18


# Throw-away build stage to reduce size of final image
FROM base as build -debian

# Install packages needed to build node modules
RUN apt-get update -qq && \
    apt-get install -y python-is-python3 pkg-config build-essential

# Install node modules
COPY --link package.json yarn.lock .
RUN yarn install

# Copy application code
COPY --link . .



# Final stage for app image
FROM base

# Copy built application
COPY --from=build /src/pg-app /src/pg-app

# Start the server by default, this can be overwritten at runtime
CMD [ "yarn", "run", "start" ]
