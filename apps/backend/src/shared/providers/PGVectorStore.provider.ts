import {
  DistanceStrategy,
  PGVectorStore,
} from "@langchain/community/vectorstores/pgvector";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { Provider } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PoolConfig } from "pg";
import { DataSource } from "typeorm";

export const PGVectorStoreProvider: Provider = {
  provide: "PGVectorStore",
  useFactory: async (configService: ConfigService, dataSource: DataSource) => {
    let result: any[] = [];
    try {
      result = await dataSource.query(`SELECT * FROM settings LIMIT 1`);
    } catch {
      // Table settings might not exist yet during migration
    }

    const apiKey =
      configService.get<string>("GEMINI_API_KEY") ||
      result?.[0]?.geminiAPIKey ||
      "dummy-key";

    const embeddings = new GoogleGenerativeAIEmbeddings({
      model: "text-embedding-004", // Google Gemini embeddings model (text-embedding-004 / gemini-embedding-2)
      apiKey,
    });

    const config = {
      postgresConnectionOptions: {
        type: "postgres",
        connectionString: configService.get<string>("PG_CONNECTION_STRING"),
      } as PoolConfig,
      tableName: "scraping_vector_store",
      columns: {
        idColumnName: "ID",
        vectorColumnName: "vector",
        contentColumnName: "content",
        metadataColumnName: "metadata",
      },
      distanceStrategy: "cosine" as DistanceStrategy,
    };

    return await PGVectorStore.initialize(embeddings, config);
  },
  inject: [ConfigService, DataSource],
};
