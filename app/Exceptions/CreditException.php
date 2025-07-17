<?php

namespace App\Exceptions;

use Exception;
use Throwable;

class CreditException extends Exception
{
    protected $data;

    public function __construct(array $data, $message = "", $code = 0, Throwable $previous = null)
    {
        $this->data = $data;
        parent::__construct($message ?: ($data['message'] ?? ''), $code, $previous);
    }

    public function getData()
    {
        return $this->data;
    }
}