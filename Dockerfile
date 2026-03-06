FROM node:25-alpine AS builder

# Build stage: install deps, build, then remove devDependencies
WORKDIR /app
COPY package*.json ./
COPY package-lock.json* ./
RUN npm ci --silent
COPY . .
RUN npm run build

# If next.config.ts exists, transpile it to next.config.js in the builder
RUN if [ -f next.config.ts ]; then \
	node -e "const fs=require('fs'),ts=require('typescript');const s=fs.readFileSync('next.config.ts','utf8');const out=ts.transpileModule(s,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,esModuleInterop:true,allowSyntheticDefaultImports:true}}).outputText;const wrapped = out + '\nmodule.exports = (typeof exports.default !== \"undefined\") ? exports.default : exports;';fs.writeFileSync('next.config.js', wrapped);"; \
fi

# Remove development dependencies to keep node_modules small
RUN npm prune --production --silent

# Runtime stage using platformatic/node-caged
FROM platformatic/node-caged:25-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules

# Copy build artifacts
COPY --from=builder /app/.next ./.next
# Copy transpiled next.config.js (avoid runtime TS transpilation)
COPY --from=builder /app/next.config.js ./next.config.js
COPY --from=builder /app/public ./public
COPY --from=builder /app/scripts ./scripts

# Copy and make executable the start script
COPY --from=builder /app/scripts/start.sh ./start.sh
# Normalize line endings (avoid CRLF issues on Windows) and make executable
RUN sed -i 's/\r$//' ./start.sh && chmod +x ./start.sh

# Expose port and default command
ARG PORT=3000
EXPOSE $PORT
CMD ["./start.sh"]