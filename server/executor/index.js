import express from 'express';

async function evalAndCaptureOutput(code) {
    const oldLog = console.log;
    const oldError = console.error;

    let output = [];
    let errorOutput = [];

    console.log = (...args) => output.push(args.join(' '));
    console.error = (...args) => errorOutput.push(args.join(' '));

    try {
        await eval(code);
    } catch (error) {
        errorOutput.push(error.message);
    }

    console.log = oldLog;
    console.error = oldError;

    return { stdout: output.join('\n'), stderr: errorOutput.join('\n') };
}

const app = express();
const port = 3000;

app.use(express.json());

app.post('/', async (req, res) => {
    const code = req.body.code;

    const result = await evalAndCaptureOutput(code);

    res.json(result);
});

app.listen(port, () => {
    console.log(`JS Executor app listening on port ${port}`);
});