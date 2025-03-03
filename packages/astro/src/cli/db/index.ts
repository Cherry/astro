import type { Arguments } from 'yargs-parser';
import { createLoggerFromFlags, flagsToAstroInlineConfig } from '../flags.js';
import { getPackage } from '../install-package.js';
import { resolveConfig } from '../../core/config/config.js';
import type { AstroConfig } from '../../@types/astro.js';
import { apply as applyPolyfill } from '../../core/polyfill.js';

type DBPackage = {
	cli: (args: { flags: Arguments; config: AstroConfig }) => unknown;
};

export async function db({ flags }: { flags: Arguments }) {
	applyPolyfill();
	const logger = createLoggerFromFlags(flags);
	const getPackageOpts = { skipAsk: flags.yes || flags.y, cwd: flags.root };
	const dbPackage = await getPackage<DBPackage>('@astrojs/db', logger, getPackageOpts, []);

	if (!dbPackage) {
		logger.error(
			'check',
			'The `@astrojs/db` package is required for this command to work. Please manually install it in your project and try again.'
		);
		return;
	}

	const { cli } = dbPackage;

	const inlineConfig = flagsToAstroInlineConfig(flags);
	const { astroConfig } = await resolveConfig(inlineConfig, 'build');

	await cli({ flags, config: astroConfig });
}
