import { clsx } from "clsx"
import { format } from "date-fns";
import { twMerge } from "tailwind-merge"
import { toast } from '@/hooks/use-toast';

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export function generateQueryFromObject(obj) {
    return Object.keys(obj).map((key) => `${key}=${obj[key]}`).join('&');
}

export default function debounce(fn, delay = 250) {
    let timeout;

    return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
            fn(...args);
        }, delay);
    };
}

/*
Format a date object to a string
* @param {Date} date
* @param {string} formatString format d/M/yyyy
* @param {boolean} withTime (optional) include time in the format (default: false)
*/
export const formatFriendlyDate = (dateString = '', withTime = false) => {
    if (!dateString) return '-';

    var date = null;
    if (dateString instanceof Date) {
        date = dateString;
    } else {
        date = new Date(dateString);
    }

    return format(new Date(dateString), 'd/M/yyyy' + (withTime ? ' hh:mma' : ''));
}

export const timestampToDate = (timestamp) => {
    return new Date(timestamp * 1000);
}


/*
Copy a string to the clipboard
* @param {string} value
* @returns {void}
*/
export const copyToClipboard = (value = '') => {
    const textField = document.createElement('textarea');
    textField.style.whiteSpace = 'pre';
    textField.value = value;
    document.body.appendChild(textField);
    textField.select();
    document.execCommand('copy');
    textField.remove();

    toast({ variant: 'success', title: 'Copied to clipboard' });
};
