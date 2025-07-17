<?php

namespace App\Repositories;

use App\Models\ApiKey;
use App\Models\User;
use App\Models\Wallet;
use App\Models\WalletHistory;

class ApiKeyRepository
{
    private ApiKey $model;

    public function __construct(ApiKey $apiKey)
    {
        $this->model = $apiKey;
    }

    public function generateToken()
    {
        do {

            $chunks = array();
            for ($i = 0; $i < 4; $i++) {
                $chunks[] = strtoupper(bin2hex(random_bytes(2)));
            }
            $token = implode('-', $chunks);
        } while (ApiKey::where('token', $token)->exists());
        return $token;
    }

    public function store($data)
    {
        try {
            if (empty($data['token'])) {
                $data['token'] = $this->generateToken();
            }
            $apiKey = $this->model->create($data);
            return $apiKey;
        } catch (\Throwable $e) {
            log_error($e);
            return false;
        }
    }
}
