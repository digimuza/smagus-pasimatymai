import { SpanStatusCode, trace } from "@opentelemetry/api";

const tracer = trace.getTracer("santykiu-klausimai");

export function withSpan<T>(
	name: string,
	attributes: Record<string, string | number | boolean>,
	fn: () => Promise<T>,
): Promise<T> {
	return tracer.startActiveSpan(name, { attributes }, async (span) => {
		try {
			const result = await fn();
			return result;
		} catch (error) {
			span.recordException(error as Error);
			span.setStatus({
				code: SpanStatusCode.ERROR,
				message: (error as Error).message,
			});
			throw error;
		} finally {
			span.end();
		}
	});
}

export function recordError(error: unknown): void {
	const span = trace.getActiveSpan();
	if (span) {
		span.recordException(error as Error);
		span.setStatus({
			code: SpanStatusCode.ERROR,
			message: (error as Error).message,
		});
	}
}
