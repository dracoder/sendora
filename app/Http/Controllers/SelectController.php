<?php

namespace App\Http\Controllers;

use App\Models\Country;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;

class SelectController extends Controller
{
    public string $model;

    public function selectOptions(Request $request, string $model)
    {
        $modelName = ucfirst($model);
        $model = "App\\Models\\" . ucfirst($model);
        $limit = $request->query('limit', 10);
        $order = $request->query('order', 'asc');
        $orderBy = $request->query('orderBy', 'id');
        $search = $request->query('search', '');
        $labelKey = $request->query('labelKey', 'name');
        $filters = $request->query('filters', '');
        $scoped = $request->query('scoped', '');
        $searchKeys = $request->query('searchKeys', null);
        $searchIds = $request->query('searchIds');
        $searchIds = is_array($searchIds) ? $searchIds : json_decode($searchIds, true) ?? [];
        $concat = $request->query('concat');
        $concat = is_array($concat) ? $concat : json_decode($concat, true) ?? [];
        $hideIds = $request->query('hideIds', null);

        $query = $model::query();

        if (!empty($concat)) {
            $query->select('id as value', DB::raw("CONCAT_WS(' ', " . implode(', ', $concat) . ") as label"));
        } else {
            if ($modelName === 'User' && $labelKey === 'name') {
                $query->select('id as value', DB::raw("CONCAT(first_name, ' ', COALESCE(last_name, '')) as label"));
            } else {
                $query->select("id as value", DB::raw("$labelKey as label"));
            }
        }

        if (!empty($searchIds)) {
            $query->whereIn('id', $searchIds);
        }

        if ($searchKeys) {
            $searchKeys = explode(',', $searchKeys);
            $query->where(function ($q) use ($searchKeys, $search) {
                foreach ($searchKeys as $field) {
                    if ($field == 'full_name') {
                        $q->orWhere(DB::raw("CONCAT(first_name, ' ', last_name)"), 'like', "%$search%");
                    } else {
                        $q->orWhere($field, 'like', "%$search%");
                    }
                }
            });
        }

        if ($filters) {
            $filters = is_array($filters) ? $filters : json_decode($filters, true);
            if ($filters) {
                $query->filter($filters);
            }
        }

        if ($scoped) {
            $scoped = is_array($scoped) ? $scoped : json_decode($scoped, true);
            if ($scoped) {
                foreach ($scoped as $field => $value) {
                    if ($modelName === 'Tag') {
                        $query->where(function ($q) use ($field, $value) {
                            $q->where($field, $value)->orWhereNull($field);
                        });
                    } else {
                        $query->where($field, $value);
                    }
                }
            }
        }

        if ($hideIds) {
            $query->whereNotIn('id', explode(',', $hideIds));
        }

        return $query->orderBy($orderBy, $order)->limit($limit)->get();
    }

    public function countries()
    {
        return Cache::remember('countries', 3600, function () {
            return Country::query()->select('code as value', 'name as label')->get();
        });
    }
}
