<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Unsubscribed Successfully</title>
    @vite('resources/css/app.css')
</head>

<body class="bg-gray-100 flex items-center justify-center min-h-screen">
    <div class="bg-white shadow-lg rounded-lg p-3 max-w-md mx-auto text-center space-y-4">
        <svg class="w-12 h-12 mx-auto text-green-500 mb-4" xmlns="http://www.w3.org/2000/svg"
            xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" viewBox="0 0 36 36"
            preserveAspectRatio="xMidYMid meet" fill="currentColor">
            <title>success-standard-solid</title>
            <path class="clr-i-solid clr-i-solid-path-1"
                d="M18,2A16,16,0,1,0,34,18,16,16,0,0,0,18,2ZM28.45,12.63,15.31,25.76,7.55,18a1.4,1.4,0,0,1,2-2l5.78,5.78L26.47,10.65a1.4,1.4,0,1,1,2,2Z">
            </path>
            <rect x="0" y="0" width="36" height="36" fill-opacity="0"></rect>
        </svg>
        <h1 class="text-2xl font-semibold mb-2">{{ $message }}</h1>
        <p class="text-gray-600 mb-6">{{ __('messages.unsubscribe_message') }}</p>
    </div>
</body>

</html>
