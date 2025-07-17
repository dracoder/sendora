<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Unsubscribe Error</title>
    @vite('resources/css/app.css')
</head>

<body class="bg-gray-100 flex items-center justify-center min-h-screen">
    <div class="bg-white shadow-lg rounded-lg p-6 max-w-lg mx-auto text-center space-y-4">
        <!-- Smaller Icon -->
        <svg class="w-12 h-12 mx-auto text-red-500 mb-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
            fill="currentColor">
            <path
                d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.707 16.293l-1.414 1.414L12 13.414l-4.293 4.293-1.414-1.414L10.586 12 6.293 7.707l1.414-1.414L12 10.586l4.293-4.293 1.414 1.414L13.414 12l4.293 4.293z" />
        </svg>
        <h1 class="text-2xl font-semibold mb-2 text-red-500">{{ $message }}</h1>
        <p class="text-gray-600 mb-6">{{ __('messages.unsubscribe_error_message') }}</p>
    </div>
</body>

</html>
