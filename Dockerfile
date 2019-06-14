FROM node:8

WORKDIR /app

# Install dependencies
COPY ./package*.json /app/
RUN npm install

# Copy the project to the image
COPY . /app

CMD ["npm", "start"]
