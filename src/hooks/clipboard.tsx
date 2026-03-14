import { useState } from "react";

export function useCopyToClipboard({ timeout = 2000 } = {}) {
	const [isCopied, setIsCopied] = useState(false);

	const copyToClipboard = (text: string) => {
		navigator.clipboard.writeText(text).then(() => {
			setIsCopied(true);
			setTimeout(() => setIsCopied(false), timeout);
		});
	};

	return { copyToClipboard, isCopied };
}
