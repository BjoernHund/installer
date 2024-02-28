import * as path from 'path';
import fs from 'fs-extra';

import defaultConfig from './postProcessConfig.json';

interface PostProcessValue {
    oldValue: string | RegExp,
    newValue: string
}

interface PostProcessFile {
    fileName: string;
    values: PostProcessValue | PostProcessValue[]
}

interface PostProcessConfiguration {
    files: PostProcessFile[];
}

export const processFiles = async (addOnKey: string, installDir: string): Promise<void> => {
    if (addOnKey !== 'A32NX') {
        return;
    }

    // const configuration = await getConfiguration();
    const configuration = defaultConfig;
    configuration?.files?.forEach(async file => {
        const fileName = path.join(installDir, file.fileName);
        if (await fs.pathExists(fileName)) {
            await convertFile(fileName, file.values);
        }
    });
};

const convertFile = async (fileName: string, values: PostProcessValue | PostProcessValue[]): Promise<void> => {
    let saveChanges: boolean;
    let content: string = (await fs.readFile(fileName)).toString();

    if (Array.isArray(values)) {
        values.forEach(async value => {
            const { oldValue, newValue } = value;
            content = content.replaceAll(oldValue, newValue);
            saveChanges = true;
        });
    } else {
        const { oldValue, newValue } = values;
        content = content.replaceAll(oldValue, newValue);
        saveChanges = true;
    }

    if (saveChanges) {
        await fs.writeFile(fileName, content);
    }
};

const getConfiguration = async (): Promise<PostProcessConfiguration> => {
    let configuration: PostProcessConfiguration;

    const configPath = path.join(process.env.APPDATA, 'FlyByWire Installer');
    const configFile = path.join(configPath, 'postProcessConfig.json');

    if (!await fs.pathExists(configPath)) {
        await fs.mkdirp(configPath);
    }

    if (await fs.pathExists(configFile)) {
        configuration = JSON.parse((await fs.readFile(configFile)).toString());
    } else {
        configuration = defaultConfig;
        await fs.writeFile(configFile, JSON.stringify(configuration));
    }

    return configuration;
};
