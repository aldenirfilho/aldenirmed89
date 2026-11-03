FROM node:24-alpine
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts --omit=dev --no-audit --no-fund
COPY src ./src
COPY catalog.json ./catalog.json
RUN mkdir /data && chown node:node /data
USER node
ENV PORT=8788 DATABASE_PATH=/data/membership.sqlite SALES_ENABLED=false
EXPOSE 8788
CMD ["node","src/server.mjs"]
