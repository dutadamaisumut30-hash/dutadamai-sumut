# Build multi-tahap. Target: "web" (aplikasi, output standalone) dan "alat" (migrasi dan skrip admin).
# Node 25 ke atas tidak membawa corepack, jadi pnpm dipasang lewat npm.
FROM node:26-slim AS dasar
RUN npm install -g pnpm@10
WORKDIR /app

FROM dasar AS dependensi
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

FROM dependensi AS build
COPY . .
# NEXT_PUBLIC_* ditanam saat build, jadi kunci situs Turnstile harus diberikan di sini.
ARG NEXT_PUBLIC_TURNSTILE_SITE_KEY
ENV NEXT_PUBLIC_TURNSTILE_SITE_KEY=$NEXT_PUBLIC_TURNSTILE_SITE_KEY
ENV NEXT_TELEMETRY_DISABLED=1
# Nilai ini hanya ada selama tahap build dan tidak ikut ke image web.
ENV BETTER_AUTH_SECRET=hanya-untuk-build-tidak-dipakai-di-produksi-0123456789
RUN pnpm build

# Alat sekali jalan: migrasi database dan pembuatan akun. Berisi dependensi lengkap.
FROM build AS alat
ENV NODE_ENV=production
CMD ["pnpm", "exec", "drizzle-kit", "migrate"]

FROM node:26-slim AS web
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    HOSTNAME=0.0.0.0 \
    PORT=3000 \
    PENYIMPANAN_DIR=/data/penyimpanan
WORKDIR /app
COPY --from=build --chown=node:node /app/public ./public
COPY --from=build --chown=node:node /app/.next/standalone ./
COPY --from=build --chown=node:node /app/.next/static ./.next/static
RUN mkdir -p /data/penyimpanan && chown -R node:node /data
USER node
EXPOSE 3000
CMD ["node", "server.js"]
